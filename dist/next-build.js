"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("./utils");
async function build(prDirectory, baseDirectory) {
    await fs_extra_1.default.copyFile(`${prDirectory}/.env-sample`, `${prDirectory}/.env`);
    await fs_extra_1.default.copyFile(`${baseDirectory}/.env-sample`, `${baseDirectory}/.env`);
    return Promise.all([
        utils_1.execAsync(`cd ${prDirectory} && yarn && NODE_ENV=production yarn build`),
        utils_1.execAsync(`cd ${baseDirectory} && yarn && NODE_ENV=production yarn build`),
    ]);
}
exports.build = build;
