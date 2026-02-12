// Test script pour le multijoueur
const testMultiplayer = async () => {
  try {
    console.log('Testing multiplayer search...');
    
    const response = await fetch('http://localhost:3000/api/multiplayer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeControl: 'blitz',
        gameType: 'friendly',
        questionCount: 20
      })
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testMultiplayer();
