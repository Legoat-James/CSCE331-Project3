import React, { useEffect, useState } from 'react'
import { Stack, Image, Spinner } from 'react-bootstrap'
import './Weather.css'
import clear_icon from '../../assets/clear.png'
import cloud_icon from '../../assets/cloud.png'
import rain_icon from '../../assets/rain.png'
import snow_icon from '../../assets/snow.png'
import drizzle_icon from '../../assets/drizzle.png'

const Weather = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const allIcons = {
        "01d": clear_icon, 
        "01n": clear_icon,
        "02d": cloud_icon, 
        "02n": cloud_icon,
        "03d": cloud_icon,
        "03n": cloud_icon, 
        "04d": drizzle_icon,
        "04n": drizzle_icon, 
        "09d": rain_icon,
        "09n": rain_icon,
        "10d": rain_icon,
        "10n": rain_icon,
        "13d": snow_icon,
        "13n": snow_icon,
    }

    const search = async (city) => {
        try {
            setIsLoading(true);
            const url = `/api/weather?city=${encodeURIComponent(city)}`
            const response = await fetch(url)
            const data = await response.json()
            const icon = allIcons[data.icon] || clear_icon;
            setWeatherData({
                humidity: data.humidity,
                windSpeed: data.windSpeed, 
                temperature: data.temperature,
                location: data.location,
                icon: icon
            })
        }
        catch (error) {
            console.error('Error fetching weather data:', error)
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        search('College Station')
    }, [])

    if (isLoading) {
        return (
            <div className="weather-widget">
                <Spinner animation="border" size="sm" className="weather-spinner" />
            </div>
        );
    }

    if (!weatherData) {
        return null;
    }

    return (
        <Stack direction="horizontal" gap={2} className="weather-widget">
            <Image 
                src={weatherData.icon} 
                alt="Weather condition" 
                className="weather-icon"
            />
            <Stack gap={0} className="weather-info">
                <span className="weather-temp">{weatherData.temperature}°F</span>
                <span className="weather-location">{weatherData.location}</span>
            </Stack>
            <div className="weather-divider" />
            <Stack gap={0} className="weather-details">
                <span className="weather-detail">
                    💧 {weatherData.humidity}%
                </span>
                <span className="weather-detail">
                    💨 {weatherData.windSpeed} mph
                </span>
            </Stack>
        </Stack>
    )
}

export default Weather