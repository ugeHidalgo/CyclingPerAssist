import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


SCRIPTS = Path(__file__).resolve().parents[1] / "scripts" / "bash"


class FeaturePathConsumerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "project with spaces"
        templates = self.root / ".specify" / "templates"
        templates.mkdir(parents=True)
        (templates / "tasks-template.md").write_text("# Task template\n", encoding="utf-8")
        self.feature = "specs/001-ride 'quoted' $(touch injected)"
        self.directory = self.root / self.feature
        self.env = os.environ.copy()
        for key in ("SPECIFY_FEATURE", "SPECIFY_FEATURE_DIRECTORY", "SPECIFY_FEATURE_NO_PERSIST"):
            self.env.pop(key, None)
        self.env["SPECIFY_INIT_DIR"] = str(self.root)
        self.env["SPECIFY_FEATURE_DIRECTORY"] = self.feature

    def run_script(self, script, *args):
        return subprocess.run(
            ["bash", str(SCRIPTS / script), *args],
            cwd=self.root,
            env=self.env,
            text=True,
            capture_output=True,
            check=False,
        )

    def make_feature(self):
        self.directory.mkdir(parents=True)
        (self.directory / "plan.md").write_text("# Plan\n", encoding="utf-8")
        (self.directory / "spec.md").write_text("# Spec\n", encoding="utf-8")

    def test_consumers_do_not_use_eval(self):
        for script in ("setup-tasks.sh", "check-prerequisites.sh"):
            with self.subTest(script=script):
                content = (SCRIPTS / script).read_text(encoding="utf-8")
                self.assertNotRegex(content, r"(?m)^\s*eval(?:\s|$)")

    def test_paths_only_is_literal_and_does_not_persist(self):
        result = self.run_script("check-prerequisites.sh", "--paths-only", "--json")
        self.assertEqual(result.returncode, 0, result.stderr)
        output = json.loads(result.stdout)
        self.assertEqual(output["FEATURE_DIR"], str(self.directory))
        self.assertEqual(output["FEATURE_SPEC"], str(self.directory / "spec.md"))
        self.assertEqual(output["TASKS"], str(self.directory / "tasks.md"))
        self.assertFalse((self.root / ".specify" / "feature.json").exists())
        self.assertFalse((self.root / "injected").exists())

    def test_prerequisites_validate_and_report_available_docs(self):
        self.make_feature()
        (self.directory / "research.md").write_text("# Research\n", encoding="utf-8")
        (self.directory / "tasks.md").write_text("# Tasks\n", encoding="utf-8")
        result = self.run_script(
            "check-prerequisites.sh", "--json", "--require-spec", "--require-tasks",
            "--include-tasks", "--template", "tasks-template",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        output = json.loads(result.stdout)
        self.assertEqual(output["FEATURE_DIR"], str(self.directory))
        self.assertEqual(output["AVAILABLE_DOCS"], ["research.md", "tasks.md"])
        self.assertEqual(output["TEMPLATE_CONTENT"], "# Task template\n")
        self.assertEqual(
            json.loads((self.root / ".specify" / "feature.json").read_text(encoding="utf-8")),
            {"feature_directory": self.feature},
        )

    def test_missing_required_files_are_reported(self):
        self.make_feature()
        result = self.run_script("check-prerequisites.sh", "--require-tasks")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("tasks.md not found", result.stderr)
        (self.directory / "plan.md").unlink()
        result = self.run_script("setup-tasks.sh", "--json")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("plan.md not found", result.stderr)

    def test_task_setup_reports_template_and_available_docs(self):
        self.make_feature()
        (self.directory / "quickstart.md").write_text("# Quickstart\n", encoding="utf-8")
        result = self.run_script("setup-tasks.sh", "--json")
        self.assertEqual(result.returncode, 0, result.stderr)
        output = json.loads(result.stdout)
        self.assertEqual(output["FEATURE_DIR"], str(self.directory))
        self.assertEqual(output["AVAILABLE_DOCS"], ["quickstart.md"])
        self.assertEqual(output["TASKS_TEMPLATE_CONTENT"], "# Task template\n")
        self.assertFalse((self.root / "injected").exists())


if __name__ == "__main__":
    unittest.main()
