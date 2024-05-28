# Yam Eats Courier App

Welcome to the Yam Eats Courier App! This project is a mobile application built with React Native, AWS Amplify, and Google Places API, designed to streamline the process for couriers to register, pick up orders from restaurants, and deliver them to customers. The app provides real-time location updates, navigation, and distance and time details to enhance the delivery experience.

## Features

- **Courier Registration**: Couriers can sign up and create a profile.
- **Order Pickup**: Couriers can view and pick up orders from restaurants.
- **Order Delivery**: Couriers can deliver orders to customers.

- **Real-Time Location Updates**: Provides real-time location tracking of couriers.
- **Navigation**: Real-time navigation to the restaurant and customer locations.
- **Distance and Time Details**: Displays distance and estimated time of arrival.

Map Navigation | Orders | Order details | Destination routing
--- | --- | --- |--- 
<img src="https://github.com/gh-shujauddin/yam-eats-courier/assets/73093103/6e6c3f69-c85c-4807-bc69-bb3cc51b6630" width="300" /> | <img src="https://github.com/gh-shujauddin/yam-eats-courier/assets/73093103/dc3259ac-6c78-411f-9e36-011cdd78190c" width="300" /> | <img src="https://github.com/gh-shujauddin/yam-eats-courier/assets/73093103/7cdeb382-b418-40fd-885f-feb0bfe02afb" width="300" />  | <img src="https://github.com/gh-shujauddin/yam-eats-courier/assets/73093103/90dddbc6-fd26-47e6-b216-0071612ac67e" width="300" />

<br />

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine.
- React Native development environment set up.
- AWS Amplify CLI installed and configured.
- Google Places API key.

### Installation

1. Clone the repository:
    
```sh
    git clone https://github.com/gh-shujauddin/yam-eats-courier.git
```

2. Navigate to the project directory:
    
```sh
    cd yam-eats-courier-app
```

3. Install the dependencies:
    
```sh
    npm install
```


### Configuration

1. Initialize AWS Amplify in your project:
    
```sh
    amplify init
```

2. Add the necessary Amplify categories (e.g., Auth, API, Storage):
    
```sh
    amplify add auth
    amplify add api
    amplify add storage
```

3. Push the configuration to AWS:
    
```sh
    amplify push
```

### Running the Application

1. Start the React Native development server:
    
```sh
    npm start
```

2. Run the app on your emulator or physical device:
    
```sh
    npm run android   # For Android
    npm run ios       # For iOS
```

## Usage

- **Register as a Courier**: Open the app and navigate to the "Register" section to create a profile.
- **Pick Up Orders**: View available orders and select one to pick up from a restaurant.
- **Deliver Orders**: Navigate to the customer's location to deliver the order.
- **Track Real-Time Location**: Use the app to update your location in real-time.
- **Navigation**: Follow real-time navigation to the restaurant and customer locations.
- **View Distance and Time**: Check the distance and estimated time of arrival for deliveries.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a Pull Request.

## Contact

If you have any questions or suggestions, feel free to reach out:

- Email: mshuja.uq@gmail.com
- GitHub: [yourusername](https://github.com/gh-shujauddin)

---

Thank you for using the Yam Eats Courier App! We hope it enhances your delivery experience.
