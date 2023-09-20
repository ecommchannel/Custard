  ZipBarangay = [];
  const customer_address_store = JSON.parse(localStorage.getItem("customer_address"));

  getCitystore(customer_address_store.city);


  function getCitystore(city) {

    url = `https://tools.gabcgfs.com/address_finder_dev.php?CITY=${city}`;
    jQuery.ajax({url: url, type: "GET", dataType: "jsonp", contentType: "application/json; charset=UTF-8"}).done(function(json) {

      for (let i = 0; i < json[0].CITY[0].BARANGAY.length; i++) {
        const arrZ = [
          json[0].CITY[0].BARANGAY[i].BARANGAY,
          json[0].CITY[0].BARANGAY[i].ZIP,
          json[0].CITY[0].BARANGAY[i].latitude,
          json[0].CITY[0].BARANGAY[i].longitude
        ];

        ZipBarangay.push(arrZ);
      }

      getBarangaystore(customer_address_store.barangay);

      function getBarangaystore(barangay) {

// Function to find the value for a given location
        function findValueForLocation(locationName) {
          for (let i = 0; i < ZipBarangay.length; i++) {

            if (ZipBarangay[i][0] === locationName) {
              return ZipBarangay[i][1];
            }
          }
          return null; // Return null if location is not found
        }
        function findValueForlat(locationName) {
          for (let i = 0; i < ZipBarangay.length; i++) {
            if (ZipBarangay[i][0] === locationName) {
              return ZipBarangay[i][2];
            }
          }
          return null; // Return null if location is not found
        }
        function findValueForlong(locationName) {
          for (let i = 0; i < ZipBarangay.length; i++) {
            if (ZipBarangay[i][0] === locationName) {
              return ZipBarangay[i][3];
            }
          }
          return null; // Return null if location is not found
        }

        const getZip = findValueForLocation(barangay);
        const getlat = findValueForlat(barangay);
        const getlong = findValueForlong(barangay);
      
        $("#zip").val(getZip);
        getList_Store(getlat, getlong);
      
      }

    });

  }



  function getList_Store(lat, long) {
 const lat1 = lat;
    const lon1 = long;
        function nearbydata(lat1, lon1, lat2, lon2) {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in km
      return distance.toFixed(2);
    }

    html_loading = `<div style="display: flex; justify-content: center;"><span class="loader">Loading</span></div>`;
    document.querySelector(".listStore").innerHTML = html_loading;

    let url = "https://omniproxy.goldenabc.com/storelocations/Shopify/Api/GetStoreLocations?brand=penshoppe";
    fetch(url).then((response) => response.json()).then((json) => getlocation(json));

    function getlocation(data) {
    
      let arr_data = [];
      let arr = data.message;

      for (let i = 0; i < arr.length; i++) {
        
        const Title = arr[i].Title;
        const City = arr[i].City;
        const Province = arr[i].Province;
        const Zipcode = arr[i].Zipcode;
        const Latitude = arr[i].Latitude;
        
        const Longitude = arr[i].Longitude;
              const listaddress_storedata = `${
          arr[i].Street
        } ${
          arr[i].City
        } ${
          arr[i].Country
        }`;
        
        const listStore_getkm = nearbydata(lat1, lon1, Latitude, Longitude);
       
        if (Longitude != null && Latitude != null && Title != "" && Title != "null") {
          if (listStore_getkm <= 10) {
   
            html = `<div>
            <label class="radio__label" for="checkout_delivery_option_id_${i}" style="display: flex; border-bottom: 1px solid; margin-bottom: 10px;"
            ><div class="radio__label__primary">
            <div>${Title}</div>
            <div class="small-text" style="font-size: small; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${listaddress_storedata}</div>
            </div>
            <div class="radio__label__accessory" style="width: 100%; text-align: end;">
            <div class="content-box__emphasis">Free</div>
            <div class="small-text pickup-instructions hide-on-mobile" style="font-size: small;">
            Usually ready in 24 hours
            </div>
            <span style="font-size: small; width: 10%">${listStore_getkm} Km</span>
            </div></label
            ></div>
                `;
            
            arr_data.push(html);
         
          }
        }
      }

      const locationData = arr_data.map((htmlString) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlString;
        const distanceText = tempDiv.querySelector("span:last-child").textContent;
        const distanceKm = parseFloat(distanceText.replace(" Km", ""));
        return {html: htmlString, distance: distanceKm};
      });

// Sort the location data by distance
      locationData.sort((a, b) => a.distance - b.distance);

// Rebuild the sorted HTML elements
      const sortedLocationElements = locationData.map((data) => data.html);

// Now you can use sortedLocationElements to update your HTML container
      if (sortedLocationElements.join("") == "") {
        document.querySelector(".listStore").innerHTML = `<div style="display: flex; justify-content: center;"><h1 style="
            padding: 0 12px;
            background-color: red;
            color: white;
            font-weight: 400;
            width: 100%;
            text-align: -webkit-center;
            ">There is no store near you</h1></div>`;
      } else {
        document.querySelector(".listStore").innerHTML = sortedLocationElements.join('');
      }
    }
  }