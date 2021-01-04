"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const next_build_1 = require("./next-build");
const next_size_comparison_1 = require("./next-size-comparison");
const next_size_formatter_1 = require("./next-size-formatter");
const next_size_generator_1 = require("./next-size-generator");
async function run() {
    core_1.default.debug(JSON.stringify({
        ...github_1.default.context,
        issue: github_1.default.context.issue,
        repo: github_1.default.context.repo,
    }, null, 2));
    const prDirectory = core_1.default.getInput('pr_directory_name');
    const baseDirectory = core_1.default.getInput('base_directory_name');
    const [prOutput, baseOutput] = await next_build_1.build(prDirectory, baseDirectory);
    const [prResult, baseResult] = await Promise.all([
        next_size_generator_1.getNextPagesSize(prOutput),
        next_size_generator_1.getNextPagesSize(baseOutput),
    ]);
    const comparison = next_size_comparison_1.generateComparison({
        currentResult: prResult,
        previousResult: baseResult,
    });
    const markdown = next_size_formatter_1.getComparisonMarkdown({ ...comparison, commitRange: '' });
    core_1.default.debug(markdown);
}
run().catch((err) => core_1.default.setFailed(err));
