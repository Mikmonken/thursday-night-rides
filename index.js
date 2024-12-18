require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Helper function to get random number
const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

app.get('/', async (req, res) => {
    try {
        // Get Thursday's date
        const today = new Date();
        const thursday = new Date(today);
        // If it's not Thursday, get next Thursday
        if (today.getDay() !== 4) {
            thursday.setDate(today.getDate() + ((4 + 7 - today.getDay()) % 7));
        }
        thursday.setHours(19, 45, 0, 0); // Set to 19:45

        // Format the date nicely
        const thursdayFormatted = thursday.toLocaleDateString('en-GB', { 
            weekday: 'long',
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });

        // Weather API call for Macclesfield
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=Macclesfield,UK&appid=${WEATHER_API_KEY}`
        );
        const weatherData = await weatherResponse.json();

        // Get wind speed and convert from m/s to mph
        const windSpeed = Math.round(weatherData.list[0].wind.speed * 2.237); // Convert m/s to mph
        const isWindy = windSpeed > 10; // Consider it windy if over 10 mph

        // Get sunset time
        const sunsetResponse = await fetch(
            `https://api.sunrise-sunset.org/json?lat=53.2587&lng=-2.1270&formatted=0&date=${thursday.toISOString().split('T')[0]}`
        );
        const sunsetData = await sunsetResponse.json();

        // Generate fun data
        const data = {
            willItRain: weatherData.list[0].weather[0].main === 'Rain' ? 'Yes! 🌧️' : 'Nope! ☀️',
            isWindy: isWindy ? "Yes! Dave's going to fly! 🌪️" : "Nope, Dave's safe today 🌤️",
            windSpeed: windSpeed,
            hannoLateness: getRandomNumber(0, 30),
            helmetWonkiness: getRandomNumber(1, 45),
            sunset: new Date(sunsetData.results.sunset).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            currentTime: new Date().toLocaleTimeString(),
            backgroundColor: `hsl(240, 70%, ${getRandomNumber(20, 80)}%)`,
            thursdayDate: thursdayFormatted
        };

        // After calculating thursday date
        console.log('Thursday date:', thursday);

        // Before rendering
        console.log('Data being sent to template:', data);

        // Add error checking before rendering
        if (!data.thursdayDate) {
            console.error('Thursday date is undefined!');
            data.thursdayDate = 'Date not available';
        }

        res.render('index', data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 