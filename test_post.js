const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/v1/community/posts', {
      title: "My Trip: Yokosuka",
      content: "I planned a trip to Yokosuka",
      category: "Trip Sharing",
      tripId: "673da1234567890123456789"
    }, {
      headers: {
        'Authorization': 'Bearer ' // Need token...
      }
    });
    console.log(res.data);
  } catch (err) {
    console.log(err.response ? err.response.data : err.message);
  }
}
test();
