   pipeline {
       agent any
       
       environment {
           AWS_ACCOUNT_ID="your-aws-account-id"
           AWS_DEFAULT_REGION="ap-south-1" 
           IMAGE_REPO_NAME="your-ecr-repo-name"
           IMAGE_TAG="${BUILD_NUMBER}"
           REPOSITORY_URI = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}"
       }
      
       stages {
           stage('Checkout') {
               steps {
                   checkout scm
               }
           }
       
           stage('Build Docker Image') {
               steps {
                   script {
                       docker.build("${IMAGE_REPO_NAME}:${IMAGE_TAG}")
                   }
               }
           }
      
           stage('Push to ECR') {
               steps {
                   script {
                       sh "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
                       sh "docker tag ${IMAGE_REPO_NAME}:${IMAGE_TAG} ${REPOSITORY_URI}:$IMAGE_TAG"
                       sh "docker push ${REPOSITORY_URI}:${IMAGE_TAG}"
                   }
               }
           }
           
           stage('Deploy to EKS') {
               steps {
                   script {
                       sh "sed -i 's|CONTAINER_IMAGE|${REPOSITORY_URI}:${IMAGE_TAG}|' kubernetes/deployment.yaml"
                       sh "kubectl apply -f kubernetes/deployment.yaml"
                       sh "kubectl apply -f kubernetes/service.yaml"
                   }
               }
           }
       }
   }
