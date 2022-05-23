import { API } from 'aws-amplify';

const apiName = "linksharerBookmarksApi";
const path = "/api/bookmarks"
API
  .put(apiName, path, {
      body: {
          user_id: "asdfkjhasldfkj",
          created_date: "2021-05-14",
          title: "Test Title",
          url: "www.google.com",
          image: "https://i.pinimg.com/736x/47/2b/61/472b61d49bb2c847bb7e0665497af47e.jpg",
          image_thumb: "https://i.pinimg.com/736x/47/2b/61/472b61d49bb2c847bb7e0665497af47e.jpg"
      }
  })
  .then(response => {
    // Add your code here
    console.log(response);
  })
  .catch(error => {
    console.log(error.response);
 });
