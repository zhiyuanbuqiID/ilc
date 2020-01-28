const errors = require('./errors');
const errorHandler = require('../errorHandler');
const noticeError = require('../errorHandler/noticeError');

//TODO: Handle Bot specific behaviour
function handleError(req, err, res) {
    const urlPart = `while processing request "${req.originalUrl}"`;
    if (res !== undefined) {
        const e = new errors.TailorError({message: `Tailor error ${urlPart}`, cause: err});
        errorHandler(e, req, res).catch(err => {
            noticeError(new errors.TailorError({message: 'Something went terribly wrong during error handling', cause: err}));
        });
    } else {
        noticeError(new errors.TailorError({message: `Tailor error while headers already sent ${urlPart}`, cause: err}));
    }
}

function handleFragmentError(req, fragmentAttrs, err) {
    if (fragmentAttrs.primary) {
        return;
    }

    const errOpts = {
        message: `Non-primary "${fragmentAttrs.id}" fragment error while processing "${req.originalUrl}"`,
        cause: err,
        data: { fragmentAttrs }
    };
    noticeError(new errors.FragmentError(errOpts));
}

function handleFragmentWarn(req, fragmentAttrs, err) {
    const errOpts = {
        message: `Non-primary "${fragmentAttrs.id}" fragment warning while processing "${req.originalUrl}"`,
        cause: err,
        data: { fragmentAttrs }
    };
    noticeError(new errors.FragmentWarn(errOpts));
}

/**
 * Setup error handlers for Tailor
 * @param {Tailor} tailor
 */
module.exports = function setup(tailor) {
    //General Tailor & primary fragment errors
    tailor.on('error', handleError);
    //Non-primary fragment errors
    tailor.on('fragment:error', handleFragmentError);
    //Non-primary fragment warnings
    tailor.on('fragment:warn', handleFragmentWarn);
};