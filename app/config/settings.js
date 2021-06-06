const settings = {
    dev: {
        apiBaseUrl: "https://sheeptracker-dev.appfarm.app/api/services",
        registrationUrl: 'https://sheeptracker-dev.appfarm.app/sheeptracker-signup'
    },
    prod:{
        apiBaseUrl: "https://sheeptracker.appfarm.app/api/services",
        registrationUrl: 'https://sheeptracker.appfarm.app/sheeptracker-signup'
    }
}

const getCurrentSettings = () => {
    if(__DEV__) return settings.dev;
    return settings.prod;
}

export default getCurrentSettings();