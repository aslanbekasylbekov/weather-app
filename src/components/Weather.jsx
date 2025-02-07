import React, { useState, useEffect, useRef} from 'react'
import './Weather.css'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'
import humidity_icon from '../assets/humidity.png'

const Weather = () => {

    const inputRef = useRef();
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecaseData] = useState();
    const [error, setError] = useState('');

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
        "13n": snow_icon
    }
    const search = async (city)=>{
        if(!city.trim()){
            alert("Enter City Name");
            return;
        }
    try {
        setError('');
        setWeatherData(null);
        setForecaseData([]);

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;

        const [weatherRes, forecastRes] = await Promise.all([
            fetch(weatherUrl), fetch(forecastUrl)
        ]);

        if (!weatherRes.ok || !forecastRes.ok) {
            throw new Error('City not found');
        }
        
        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        setWeatherData({
            humidity: weatherData.main.humidity,
            windSpeed:weatherData.wind.speed,
            temperature:Math.floor(weatherData.main.temp),
            location: weatherData.name,
            icon: allIcons[weatherData.weather[0].icon] || clear_icon
        });

        const dailyForecast = processForecastData(forecastData.list);
        setForecaseData(dailyForecast);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        setError("City not found. Please try again."); 
    }
};

const processForecastData = (forecastList) => {
    const groupedData = {};
    forecastList.forEach((entry) => {
        const date = entry.dt_txt.split(' ')[0]; //Get the day
        if(!groupedData[date]) groupedData[date] = [];
        groupedData[date].push({
            time:entry.dt_txt.split(' ')[1].slice(0,5),
            temp:Math.floor(entry.main.temp),
            icon:allIcons[entry.weather[0].icon] || clear_icon
        });
    });
    return Object.entries(groupedData).slice(0,4); //Get only next 4 days
};

useEffect(()=>{search("Almaty")},[])
  return (
    <div className='weather'>
        <div className="search-bar">
            <input
                ref={inputRef}
                type='text'
                placeholder='Search'
                onKeyPress={(e) => {
                    if (e.key === 'Enter') search(inputRef.current.value);
                }}
            />
            <img src={search_icon} alt='Search' onClick={() => search(inputRef.current.value)} />
        </div>

        {error && <p className='error'>{error}</p>}
        
        {weatherData ? (
            <>
                <img src={weatherData.icon} alt="" className='weather-icon'/>
                <p className='temp'>{weatherData.temperature}°C</p>
                <p className='location'>{weatherData.location}</p>
                <div className="weather-data">
                    <div className="col">
                        <img src={humidity_icon} alt="" />
                        <div>
                            <p>{weatherData.humidity}%</p>
                            <span>Humidity</span>
                        </div>
                    </div>
                    <div className="col">
                        <img src={wind_icon} alt="" />
                        <div>
                            <p>{weatherData.windSpeed} m/s</p>
                            <span>Wind Speed</span>
                        </div>
                    </div>
                </div>
                <div className='forecast'>
                    <h2>4-Day Hourly Forecast</h2>
                    {forecastData.map(([date,hours])=>(
                        <div key={date} className='forecast-day'>
                            <h3>{date}</h3>
                            <div className='forecast-hours'>
                                {hours.map((hour,index)=>(
                                    <div key={index} className='forecast-hour'>
                                        <p>{hour.time}</p>
                                        <img src={hour.icon} alt='' />
                                        <p>{hour.temp}°C</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </>
            ) : !error && (
            <p>Loading weather data...</p>
            )}
    </div>
  )
}

export default Weather