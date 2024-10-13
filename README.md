# Three-Tier Application Deployment on AWS EKS

## Project Overview

This project demonstrates a three-tier application architecture, designed for deployment on Amazon Elastic Kubernetes Service (EKS). It consists of a React frontend, a Node.js backend, and a MongoDB database. The project is set up to be deployed using a Jenkins pipeline, showcasing a complete CI/CD workflow for a cloud-native application.

## Architecture

1. **Frontend**: React application
2. **Backend**: Node.js with Express
3. **Database**: MongoDB

## Local Development Setup

### Prerequisites

- Docker
- Docker Compose

### Running the Application Locally

1. Clone the repository:
   ```
   git clone [https://github.com/yourusername/your-repo-name.git](https://github.com/namdeopawar/three-tier-app-deployment-eks.git)
   cd three-tier-app-deployment-eks
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - MongoDB: localhost:27017

## Deployment

This project is set up for deployment to AWS EKS using a Jenkins pipeline.

### CI/CD Pipeline (TODO)

The Jenkins pipeline will include the following stages:

1. Code Checkout
2. Build Docker Images
3. Run Tests
4. Push Images to ECR
5. Deploy to EKS
6. Run Integration Tests
7. Cleanup

### AWS EKS Setup (TODO)

Instructions for setting up the EKS cluster and necessary AWS resources will be provided here.

## Project Structure
