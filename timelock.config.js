const TimeLockConfig = {
    default: {
        TimeLock: {
            minDelay: 5,
            maxDelay: 365 * 24 * 60 * 60,
        },
    },
    basemain: {
        TimeLock: {
            minDelay: 6 * 60 * 60,
            maxDelay: 24 * 60 * 60,
        }
    },
}

module.exports.TimeLockConfig = TimeLockConfig
