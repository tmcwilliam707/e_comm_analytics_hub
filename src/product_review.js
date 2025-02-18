import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Typography, CircularProgress } from "@mui/material";
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './product_review.css'; // Import the CSS file

const BATCH_SIZE = 100; // Define the batch size

const ReviewDashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Fetch and parse the JSON file
    fetch('/product_reviews.json')
      .then(response => response.json())
      .then(data => {
        console.log('Parsed Data:', data); // Debugging statement
        loadInBatches(data);
      })
      .catch(error => console.error('Error fetching reviews:', error));
    return () => setMounted(false);
  }, []);

  const loadInBatches = (data) => {
    let index = 0;
    const loadBatch = () => {
      if (index < data.length) {
        setReviews(prevReviews => [...prevReviews, ...data.slice(index, index + BATCH_SIZE)]);
        index += BATCH_SIZE;
        setTimeout(loadBatch, 0); // Schedule the next batch
      } else {
        setLoading(false); // Loading is complete
      }
    };
    loadBatch();
  };

  if (!mounted || loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  // Helper function to safely parse numbers
  const safeParseFloat = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculate metrics
  const averageRating = reviews.reduce((acc, curr) => acc + safeParseFloat(curr.overall), 0) / reviews.length;
  const totalReviews = reviews.length;

  console.log('Average Rating:', averageRating); // Debugging statement
  console.log('Total Reviews:', totalReviews); // Debugging statement

  // Prepare data for rating distribution
  const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
    rating: i + 1,
    count: reviews.filter(r => safeParseFloat(r.overall) === i + 1).length
  }));

  console.log('Rating Distribution:', ratingDistribution); // Debugging statement

  // Time series data (by months)
  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const timeData = reviews.reduce((acc, curr) => {
    const month = new Date(safeParseFloat(curr.unixReviewTime) * 1000).toLocaleString('default', { month: 'short' });
    const existingMonth = acc.find(d => d.month === month);
    if (existingMonth) {
      existingMonth.reviews += 1;
    } else {
      acc.push({ month, reviews: 1 });
    }
    return acc;
  }, []).sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

  console.log('Time Data:', timeData); // Debugging statement

  // Data for pie chart
  const pieData = [
    { name: '5 Stars', value: reviews.filter(r => safeParseFloat(r.overall) === 5).length },
    { name: '4 Stars', value: reviews.filter(r => safeParseFloat(r.overall) === 4).length },
    { name: '3 Stars', value: reviews.filter(r => safeParseFloat(r.overall) === 3).length },
    { name: '2 Stars', value: reviews.filter(r => safeParseFloat(r.overall) === 2).length },
    { name: '1 Star', value: reviews.filter(r => safeParseFloat(r.overall) === 1).length }
  ];

  console.log('Pie Data:', pieData); // Debugging statement

  // Extract additional statistics
  const accuracy = reviews.reduce((acc, curr) => acc + safeParseFloat(curr.Accuracy), 0) / reviews.length;
  const precision = reviews.reduce((acc, curr) => acc + safeParseFloat(curr.Precision), 0) / reviews.length;
  const recall = reviews.reduce((acc, curr) => acc + safeParseFloat(curr.Recall), 0) / reviews.length;
  const f1Score = reviews.reduce((acc, curr) => acc + safeParseFloat(curr['F1 Score']), 0) / reviews.length;

  console.log('Accuracy:', accuracy); // Debugging statement
  console.log('Precision:', precision); // Debugging statement
  console.log('Recall:', recall); // Debugging statement
  console.log('F1 Score:', f1Score); // Debugging statement

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card elevation={2} className="futuristic-card">
            <CardHeader title="Average Rating" className="futuristic-card-header" />
            <CardContent className="futuristic-card-content">
              <Typography variant="h4" className="futuristic-typography">{averageRating.toFixed(1)}/5.0</Typography>
            </CardContent>
          </Card>
          
          <Card elevation={2} className="futuristic-card">
            <CardHeader title="Total Reviews" className="futuristic-card-header" />
            <CardContent className="futuristic-card-content">
              <Typography variant="h4" className="futuristic-typography">{totalReviews}</Typography>
            </CardContent>
          </Card>
          
          <Card elevation={2} className="futuristic-card">
            <CardHeader title="5-Star Reviews" className="futuristic-card-header" />
            <CardContent className="futuristic-card-content">
              <Typography variant="h4" className="futuristic-typography">
                {((reviews.filter(r => safeParseFloat(r.overall) === 5).length / totalReviews) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card elevation={2} className="futuristic-card">
            <CardHeader title="Accuracy" className="futuristic-card-header" />
            <CardContent className="futuristic-card-content">
              <Typography variant="h4" className="futuristic-typography">{accuracy.toFixed(2)}</Typography>
            </CardContent>
          </Card>

          <Card elevation={2} className="futuristic-card">
            <CardHeader title="Precision" className="futuristic-card-header" />
            <CardContent className="futuristic-card-content">
              <Typography variant="h4" className="futuristic-typography">{precision.toFixed(2)}</Typography>
            </CardContent>
          </Card>

          <Card elevation={2} className="futuristic-card">
            <CardHeader title="Recall" className="futuristic-card-header" />
            <CardContent className="futuristic-card-content">
              <Typography variant="h4" className="futuristic-typography">{recall.toFixed(2)}</Typography>
            </CardContent>
          </Card>

          <Card elevation={2} className="futuristic-card">
            <CardHeader title="F1 Score" className="futuristic-card-header" />
            <CardContent className="futuristic-card-content">
              <Typography variant="h4" className="futuristic-typography">{f1Score.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card elevation={2} className="futuristic-card">
            <CardHeader title="Rating Distribution" className="futuristic-card-header" />
            <CardContent className="futuristic-card-content">
              <div className="h-64 p-4">
                <Bar
                  data={{
                    labels: ratingDistribution.map(d => d.rating),
                    datasets: [{
                      label: 'Rating Distribution',
                      data: ratingDistribution.map(d => d.count),
                      backgroundColor: 'rgba(136, 132, 216, 0.6)',
                      borderColor: 'rgba(136, 132, 216, 1)',
                      borderWidth: 1,
                      hoverBackgroundColor: 'rgba(136, 132, 216, 0.8)',
                      hoverBorderColor: 'rgba(136, 132, 216, 1)'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { beginAtZero: true },
                      y: { beginAtZero: true }
                    },
                    plugins: {
                      title: {
                        display: true,
                        text: 'Rating Distribution'
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${context.raw}`;
                          }
                        }
                      }
                    },
                    animation: {
                      duration: 2000,
                      easing: 'easeInOutBounce'
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card elevation={2} className="futuristic-card">
            <CardHeader title="Reviews Over Time" className="futuristic-card-header" />
            <CardContent className="futuristic-card-content">
              <div className="h-64 p-4">
                <Line
                  data={{
                    labels: timeData.map(d => d.month),
                    datasets: [{
                      label: 'Reviews Over Time',
                      data: timeData.map(d => d.reviews),
                      backgroundColor: 'rgba(136, 132, 216, 0.6)',
                      borderColor: 'rgba(136, 132, 216, 1)',
                      borderWidth: 1,
                      fill: false,
                      pointBackgroundColor: 'rgba(136, 132, 216, 1)',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: 'rgba(136, 132, 216, 1)'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { beginAtZero: true },
                      y: { beginAtZero: true }
                    },
                    plugins: {
                      title: {
                        display: true,
                        text: 'Reviews Over Time'
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${context.raw}`;
                          }
                        }
                      }
                    },
                    animation: {
                      duration: 2000,
                      easing: 'easeInOutBounce'
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card elevation={2} className="futuristic-card">
            <CardHeader title="Rating Distribution (Pie)" className="futuristic-card-header" />
            <CardContent className="futuristic-card-content">
              <div className="h-96 p-4"> {/* Increase height to make the pie chart larger */}
                <Pie
                  data={{
                    labels: pieData.map(d => d.name),
                    datasets: [{
                      label: 'Rating Distribution',
                      data: pieData.map(d => d.value),
                      backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'],
                      borderColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'],
                      borderWidth: 1,
                      hoverBackgroundColor: ['#0077E6', '#00B38F', '#E6A800', '#E66A00', '#7764D8'],
                      hoverBorderColor: ['#0077E6', '#00B38F', '#E6A800', '#E66A00', '#7764D8']
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Rating Distribution (Pie)'
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${context.raw}`;
                          }
                        }
                      }
                    },
                    animation: {
                      duration: 2000,
                      easing: 'easeInOutBounce'
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReviewDashboard;