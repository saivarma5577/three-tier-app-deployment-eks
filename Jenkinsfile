pipeline {
    agent any
    
    environment {
        AWS_ACCOUNT_ID="058264258551"
        AWS_DEFAULT_REGION="ap-south-1" 
        FRONTEND_REPO_NAME="three-tier-frontend"
        BACKEND_REPO_NAME="three-tier-backend"
        IMAGE_TAG="${BUILD_NUMBER}"
    }
   
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
    
        stage('Build and Push Frontend') {
            steps {
                dir('frontend') {
                    script {
                        docker.build("${FRONTEND_REPO_NAME}:${IMAGE_TAG}")
                        sh "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
                        sh "docker tag ${FRONTEND_REPO_NAME}:${IMAGE_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${FRONTEND_REPO_NAME}:${IMAGE_TAG}"
                        sh "docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${FRONTEND_REPO_NAME}:${IMAGE_TAG}"
                    }
                }
            }
        }

        stage('Build and Push Backend') {
            steps {
                dir('backend') {
                    script {
                        docker.build("${BACKEND_REPO_NAME}:${IMAGE_TAG}")
                        sh "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
                        sh "docker tag ${BACKEND_REPO_NAME}:${IMAGE_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${BACKEND_REPO_NAME}:${IMAGE_TAG}"
                        sh "docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${BACKEND_REPO_NAME}:${IMAGE_TAG}"
                    }
                }
            }
        }
        
        stage('Deploy to EKS') {
               steps {
                   withCredentials([aws(credentialsId: 'AWS_CREDS', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                       script {
                           sh "aws eks --region ${AWS_DEFAULT_REGION} update-kubeconfig --name my-cluster"
                           sh "sed -i 's|FRONTEND_IMAGE|${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${FRONTEND_REPO_NAME}:${IMAGE_TAG}|' k8s/frontend-deployment.yaml"
                           sh "sed -i 's|BACKEND_IMAGE|${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${BACKEND_REPO_NAME}:${IMAGE_TAG}|' k8s/backend-deployment.yaml"
                           sh "kubectl apply -f k8s/mongodb-deployment.yaml"
                           sh "kubectl apply -f k8s/backend-deployment.yaml"
                           sh "kubectl apply -f k8s/frontend-deployment.yaml"
                           sh "kubectl apply -f k8s/mongodb-service.yaml"
                           sh "kubectl apply -f k8s/backend-service.yaml"
                           sh "kubectl apply -f k8s/frontend-service.yaml"
                       }
                   }
               }
        }
    }
}
