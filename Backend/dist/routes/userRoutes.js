"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = require("../middlewares/multer");
const authTokenMiddleware_1 = __importDefault(require("../middlewares/authTokenMiddleware"));
const userProfileController_1 = __importDefault(require("../controller/usercontroller/userProfileController"));
const userProfileDeleteController_1 = __importDefault(require("../controller/usercontroller/userProfileDeleteController"));
const updateProfileController_1 = __importDefault(require("../controller/usercontroller/updateProfileController"));
const authClerkTokenMiddleware_1 = require("../middlewares/authClerkTokenMiddleware");
const route = express_1.default.Router();
route.get('/profile', authClerkTokenMiddleware_1.protect, (req, res, next) => {
    (0, userProfileController_1.default)(req, res, next);
});
route.delete('/delete', authTokenMiddleware_1.default, (req, res, next) => {
    (0, userProfileDeleteController_1.default)(req, res, next);
});
route.put('/update', authTokenMiddleware_1.default, multer_1.upload.single('profileimage'), (req, res, next) => {
    (0, updateProfileController_1.default)(req, res, next);
});
exports.default = route;
