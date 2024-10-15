# Three-Tier Application Deployment on Amazon EKS using Jenkins CI/CD

This project demonstrates the deployment of a three-tier application (React frontend, Node.js backend, and MongoDB database) on Amazon EKS using Jenkins for CI/CD.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Compose Setup](#docker-compose-setup)
4. [Amazon EKS Deployment](#amazon-eks-deployment)
5. [Jenkins Pipeline Setup](#jenkins-pipeline-setup)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Troubleshooting](#troubleshooting)
8. [Contributing](#contributing)
9. [License](#license)

## Prerequisites

- Node.js (v14 or later)
- Docker and Docker Compose
- AWS CLI configured with appropriate permissions
- kubectl
- eksctl
- Jenkins (for CI/CD pipeline)

## Local Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/namdeopawar/three-tier-app-deployment-eks.git
   cd three-tier-app-deployment-eks
   ```

2. Set up the backend:
   ```
   cd backend
   npm install
   npm start
   ```

3. Set up the frontend:
   ```
   cd frontend
   npm install
   npm start
   ```

4. Access the application at `http://localhost:3000`

## Docker Compose Setup

1. Build and run the application using Docker Compose:
   ```
   docker-compose up --build
   ```

2. Access the application at `http://localhost:3000`

3. To stop the application:
   ```
   docker-compose down
   ```

## Amazon EKS Deployment

1. Create an EKS cluster:
   ```
   eksctl create cluster --name my-app-cluster --region ap-south-1 --nodes 2 --node-type t3.medium
   ```

2. Update your kubeconfig:
   ```
   aws eks update-kubeconfig --name my-app-cluster --region ap-south-1
   ```

3. Create ECR repositories for your images:
   ```
   aws ecr create-repository --repository-name three-tier-frontend
   aws ecr create-repository --repository-name three-tier-backend
   ```

4. Build and push Docker images to ECR:
   ```
   # Login to ECR
   aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 058264258551.dkr.ecr.ap-south-1.amazonaws.com

   # Build and push frontend image
   docker build -t three-tier-frontend:latest ./frontend
   docker tag three-tier-frontend:latest 058264258551.dkr.ecr.ap-south-1.amazonaws.com/three-tier-frontend:latest
   docker push 058264258551.dkr.ecr.ap-south-1.amazonaws.com/three-tier-frontend:latest

   # Build and push backend image
   docker build -t three-tier-backend:latest ./backend
   docker tag three-tier-backend:latest 058264258551.dkr.ecr.ap-south-1.amazonaws.com/three-tier-backend:latest
   docker push 058264258551.dkr.ecr.ap-south-1.amazonaws.com/three-tier-backend:latest
   ```

5. Apply Kubernetes manifests:
   ```
   kubectl apply -f k8s/
   ```

6. Verify the deployment:
   ```
   kubectl get pods
   kubectl get services
   ```

## Jenkins Pipeline Setup

1. Install required Jenkins plugins:
   - AWS Credentials
   - Docker Pipeline
   - Kubernetes CLI

2. Add AWS credentials to Jenkins:
   - Go to "Manage Jenkins" > "Manage Credentials"
   - Add new credentials of type "AWS Credentials"
   - ID: aws-credentials

3. Create a new pipeline job in Jenkins:
   - New Item > Pipeline
   - Configure the pipeline to use the Jenkinsfile from your repository

4. Run the pipeline and monitor the build

The Jenkinsfile includes the following stages:
- Setup kubectl
- Update Node Group
- Cleanup
- Build and Push Docker Images
- Deploy Application
- Uncordon Nodes
- Wait for Pods
- Verify Deployment
  

## Troubleshooting

- If pods are stuck in "Pending" state, check node resources:
  ```
  kubectl describe nodes
  ```

- For pod-specific issues, use:
  ```
  kubectl describe pod <pod-name>
  kubectl logs <pod-name>
  ```

- If the Jenkins pipeline fails, check the console output for specific error messages and ensure all credentials are correctly configured.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
