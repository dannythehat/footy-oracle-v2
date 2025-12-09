"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBetBuilderNotification = sendBetBuilderNotification;
exports.sendDailyBetBuilderDigest = sendDailyBetBuilderDigest;
exports.sendBetBuilderResult = sendBetBuilderResult;
var nodemailer_1 = require("nodemailer");
// Email transporter (configure with your SMTP settings)
var createTransporter = function () {
    var config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
        },
    };
    return nodemailer_1.default.createTransporter(config);
};
/**
 * Generate HTML email template for bet builder notification
 */
function generateBetBuilderEmail(betBuilders) {
    var betBuilderCards = betBuilders.map(function (bb) { return "\n    <div style=\"background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #a855f7; border-radius: 12px; padding: 20px; margin-bottom: 20px;\">\n      <div style=\"display: flex; align-items: center; margin-bottom: 15px;\">\n        <span style=\"font-size: 32px; margin-right: 10px;\">\uD83E\uDDE0</span>\n        <div>\n          <h3 style=\"color: #ffffff; margin: 0; font-size: 18px;\">".concat(bb.homeTeam, " vs ").concat(bb.awayTeam, "</h3>\n          <p style=\"color: #9ca3af; margin: 5px 0 0 0; font-size: 14px;\">").concat(bb.league, " \u2022 ").concat(new Date(bb.kickoff).toLocaleString(), "</p>\n        </div>\n      </div>\n      \n      <div style=\"background: rgba(168, 85, 247, 0.1); border-radius: 8px; padding: 15px; margin-bottom: 15px;\">\n        <h4 style=\"color: #a855f7; margin: 0 0 10px 0; font-size: 14px;\">Multi-Market Convergence</h4>\n        ").concat(bb.markets.map(function (m) { return "\n          <div style=\"display: flex; justify-content: space-between; margin-bottom: 8px;\">\n            <span style=\"color: #ffffff; font-size: 14px;\">".concat(m.marketName, "</span>\n            <span style=\"color: #a855f7; font-weight: bold; font-size: 14px;\">").concat(m.estimatedOdds.toFixed(2), " @ ").concat(m.confidence, "%</span>\n          </div>\n        "); }).join(''), "\n      </div>\n      \n      <div style=\"display: flex; justify-content: space-between; margin-bottom: 15px;\">\n        <div>\n          <p style=\"color: #9ca3af; margin: 0; font-size: 12px;\">Combined Confidence</p>\n          <p style=\"color: #a855f7; margin: 5px 0 0 0; font-size: 20px; font-weight: bold;\">").concat(bb.combinedConfidence, "%</p>\n        </div>\n        <div>\n          <p style=\"color: #9ca3af; margin: 0; font-size: 12px;\">Combined Odds</p>\n          <p style=\"color: #ec4899; margin: 5px 0 0 0; font-size: 20px; font-weight: bold;\">").concat(bb.estimatedCombinedOdds.toFixed(2), "x</p>\n        </div>\n      </div>\n      \n      <div style=\"background: rgba(251, 191, 36, 0.1); border-radius: 8px; padding: 12px;\">\n        <p style=\"color: #9ca3af; margin: 0; font-size: 12px;\">\u20AC10 Stake Returns</p>\n        <p style=\"color: #fbbf24; margin: 5px 0 0 0; font-size: 18px; font-weight: bold;\">\u20AC").concat((bb.estimatedCombinedOdds * 10).toFixed(2), "</p>\n        <p style=\"color: #10b981; margin: 5px 0 0 0; font-size: 14px;\">Profit: \u20AC").concat(((bb.estimatedCombinedOdds * 10) - 10).toFixed(2), "</p>\n      </div>\n      \n      ").concat(bb.aiReasoning ? "\n        <div style=\"margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(168, 85, 247, 0.3);\">\n          <p style=\"color: #a855f7; margin: 0 0 8px 0; font-size: 14px; font-weight: bold;\">\uD83E\uDDE0 AI Analysis</p>\n          <p style=\"color: #d1d5db; margin: 0; font-size: 13px; line-height: 1.6;\">".concat(bb.aiReasoning, "</p>\n        </div>\n      ") : '', "\n    </div>\n  "); }).join('');
    return "\n    <!DOCTYPE html>\n    <html>\n    <head>\n      <meta charset=\"utf-8\">\n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n      <title>Today's Bet Builder Opportunities</title>\n    </head>\n    <body style=\"margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\">\n      <div style=\"max-width: 600px; margin: 0 auto; padding: 20px;\">\n        <div style=\"text-align: center; margin-bottom: 30px;\">\n          <h1 style=\"background: linear-gradient(to right, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0;\">\n            \uD83E\uDDE0 Bet Builder Brain\n          </h1>\n          <p style=\"color: #9ca3af; margin: 10px 0 0 0; font-size: 16px;\">Today's High-Value Multi-Market Opportunities</p>\n        </div>\n        \n        ".concat(betBuilderCards, "\n        \n        <div style=\"text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151;\">\n          <p style=\"color: #6b7280; font-size: 12px; margin: 0;\">\n            This is an automated notification from Footy Oracle.<br>\n            These predictions are AI-generated and should be used for informational purposes only.\n          </p>\n        </div>\n      </div>\n    </body>\n    </html>\n  ");
}
/**
 * Send bet builder notification email
 */
function sendBetBuilderNotification(recipients, betBuilders) {
    return __awaiter(this, void 0, void 0, function () {
        var transporter, html, mailOptions, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (betBuilders.length === 0) {
                        console.log('No bet builders to send');
                        return [2 /*return*/];
                    }
                    transporter = createTransporter();
                    html = generateBetBuilderEmail(betBuilders);
                    mailOptions = {
                        from: "\"Footy Oracle \uD83E\uDDE0\" <".concat(process.env.SMTP_USER, ">"),
                        to: recipients.join(', '),
                        subject: "\uD83E\uDDE0 ".concat(betBuilders.length, " High-Value Bet Builder").concat(betBuilders.length > 1 ? 's' : '', " Today!"),
                        html: html,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, transporter.sendMail(mailOptions)];
                case 2:
                    _a.sent();
                    console.log("Bet builder notification sent to ".concat(recipients.length, " recipient(s)"));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error sending bet builder notification:', error_1);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Send daily bet builder digest
 */
function sendDailyBetBuilderDigest(subscribers, betBuilders) {
    return __awaiter(this, void 0, void 0, function () {
        var emails;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    emails = subscribers.map(function (s) { return s.email; });
                    return [4 /*yield*/, sendBetBuilderNotification(emails, betBuilders)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Send bet builder result notification
 */
function sendBetBuilderResult(recipients, betBuilder) {
    return __awaiter(this, void 0, void 0, function () {
        var transporter, resultEmoji, resultColor, resultText, html, mailOptions, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transporter = createTransporter();
                    resultEmoji = betBuilder.result === 'win' ? '✅' : '❌';
                    resultColor = betBuilder.result === 'win' ? '#10b981' : '#ef4444';
                    resultText = betBuilder.result === 'win' ? 'WON' : 'LOST';
                    html = "\n    <!DOCTYPE html>\n    <html>\n    <head>\n      <meta charset=\"utf-8\">\n      <title>Bet Builder Result</title>\n    </head>\n    <body style=\"margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\">\n      <div style=\"max-width: 600px; margin: 0 auto; padding: 20px;\">\n        <div style=\"text-align: center; margin-bottom: 30px;\">\n          <h1 style=\"color: ".concat(resultColor, "; font-size: 48px; margin: 0;\">").concat(resultEmoji, "</h1>\n          <h2 style=\"color: #ffffff; margin: 10px 0;\">Bet Builder ").concat(resultText, "</h2>\n        </div>\n        \n        <div style=\"background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 2px solid ").concat(resultColor, "; border-radius: 12px; padding: 20px;\">\n          <h3 style=\"color: #ffffff; margin: 0 0 10px 0;\">").concat(betBuilder.homeTeam, " vs ").concat(betBuilder.awayTeam, "</h3>\n          <p style=\"color: #9ca3af; margin: 0 0 20px 0;\">").concat(betBuilder.league, "</p>\n          \n          <div style=\"margin-bottom: 20px;\">\n            ").concat(betBuilder.markets.map(function (m) { return "\n              <div style=\"color: #d1d5db; margin-bottom: 5px;\">\u2713 ".concat(m.marketName, "</div>\n            "); }).join(''), "\n          </div>\n          \n          <div style=\"display: flex; justify-content: space-between; padding: 15px; background: rgba(168, 85, 247, 0.1); border-radius: 8px;\">\n            <div>\n              <p style=\"color: #9ca3af; margin: 0; font-size: 12px;\">Combined Odds</p>\n              <p style=\"color: #a855f7; margin: 5px 0 0 0; font-size: 20px; font-weight: bold;\">").concat(betBuilder.estimatedCombinedOdds.toFixed(2), "x</p>\n            </div>\n            <div>\n              <p style=\"color: #9ca3af; margin: 0; font-size: 12px;\">Profit/Loss</p>\n              <p style=\"color: ").concat(resultColor, "; margin: 5px 0 0 0; font-size: 20px; font-weight: bold;\">\u20AC").concat((betBuilder.profit || 0).toFixed(2), "</p>\n            </div>\n          </div>\n        </div>\n      </div>\n    </body>\n    </html>\n  ");
                    mailOptions = {
                        from: "\"Footy Oracle \uD83E\uDDE0\" <".concat(process.env.SMTP_USER, ">"),
                        to: recipients.join(', '),
                        subject: "".concat(resultEmoji, " Bet Builder ").concat(resultText, ": ").concat(betBuilder.homeTeam, " vs ").concat(betBuilder.awayTeam),
                        html: html,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, transporter.sendMail(mailOptions)];
                case 2:
                    _a.sent();
                    console.log("Bet builder result notification sent");
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error sending result notification:', error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
