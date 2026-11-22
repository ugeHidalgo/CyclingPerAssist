import json
import os
from pathlib import Path
import shlex
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "bash" / "setup-plan.sh"


class SetupPlanTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "project with spaces"
        templates = self.root / ".specify" / "templates"
        templates.mkdir(parents=True)
        (templates / "plan-template.md").write_text("# Test plan\n", encoding="utf-8")
        self.env = os.environ.copy()
        for key in ("SPECIFY_FEATURE", "SPECIFY_FEATURE_DIRECTORY", "SPECIFY_FEATURE_NO_PERSIST"):
            self.env.pop(key, None)
        self.env["SPECIFY_INIT_DIR"] = str(self.root)

    def run_setup(self, **env):
        return subprocess.run(
            ["bash", str(SCRIPT), "--json"],
            cwd=self.root,
            env={**self.env, **env},
            text=True,
            capture_output=True,
            check=False,
        )

    def test_feature_override_is_literal_and_persisted(self):
        feature = "specs/001-ride 'quoted' $(touch injected)"
        result = self.run_setup(SPECIFY_FEATURE_DIRECTORY=feature)
        self.assertEqual(result.returncode, 0, result.stderr)
        output = json.loads(result.stdout)
        directory = self.root / feature
        self.assertEqual(output["FEATURE_DIR"], str(directory))
        self.assertEqual(output["FEATURE_SPEC"], str(directory / "spec.md"))
        self.assertEqual(output["IMPL_PLAN"], str(directory / "plan.md"))
        self.assertEqual(output["BRANCH"], Path(feature).name)
        self.assertEqual((directory / "plan.md").read_text(encoding="utf-8"), "# Test plan\n")
        self.assertEqual(
            json.loads((self.root / ".specify" / "feature.json").read_text(encoding="utf-8")),
            {"feature_directory": feature},
        )
        self.assertFalse((self.root / "injected").exists())

    def test_existing_plan_is_preserved_and_feature_file_is_used(self):
        feature = self.root / "specs" / "001-ride"
        feature.mkdir(parents=True)
        (feature / "plan.md").write_text("Existing plan\n", encoding="utf-8")
        (self.root / ".specify" / "feature.json").write_text(
            json.dumps({"feature_directory": "specs/001-ride"}), encoding="utf-8"
        )
        result = self.run_setup()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)["FEATURE_DIR"], str(feature))
        self.assertEqual((feature / "plan.md").read_text(encoding="utf-8"), "Existing plan\n")

    def test_missing_feature_is_reported(self):
        result = self.run_setup()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Feature directory not found", result.stderr)
        self.assertIn("Failed to resolve feature paths", result.stderr)

    def test_explicit_feature_and_no_persist_are_preserved(self):
        result = self.run_setup(
            SPECIFY_FEATURE_DIRECTORY="specs/001-ride",
            SPECIFY_FEATURE="feature-branch",
            SPECIFY_FEATURE_NO_PERSIST="true",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)["BRANCH"], "feature-branch")
        self.assertFalse((self.root / ".specify" / "feature.json").exists())

    def test_existing_formatted_output_remains_available(self):
        result = subprocess.run(
            ["bash", "-c", 'source "$1"; get_feature_paths --no-persist', "bash",
             str(SCRIPT.parent / "common.sh")],
            cwd=self.root,
            env={**self.env, "SPECIFY_FEATURE_DIRECTORY": "specs/001-ride"},
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        assignments = dict(line.split("=", 1) for line in result.stdout.splitlines())
        self.assertEqual(
            shlex.split(assignments["FEATURE_DIR"]),
            [str(self.root / "specs" / "001-ride")],
        )
        self.assertFalse((self.root / ".specify" / "feature.json").exists())

    def test_direct_assignment_returns_literal_path_without_output(self):
        feature = "specs/001-ride 'quoted' $(touch injected)"
        result = subprocess.run(
            ["bash", "-c",
             'source "$1"; get_feature_paths --no-persist --assign; printf "%s" "$FEATURE_DIR"',
             "bash", str(SCRIPT.parent / "common.sh")],
            cwd=self.root,
            env={**self.env, "SPECIFY_FEATURE_DIRECTORY": feature},
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, str(self.root / feature))
        self.assertFalse((self.root / "injected").exists())
        self.assertFalse((self.root / ".specify" / "feature.json").exists())


if __name__ == "__main__":
    unittest.main()
