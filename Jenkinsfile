pipeline {
    agent any
    
    environment {
        AWS_ACCOUNT_ID="058264258551"
        AWS_DEFAULT_REGION="ap-south-1" 
        FRONTEND_REPO_NAME="three-tier-frontend"
        BACKEND_REPO_NAME="three-tier-backend"
        IMAGE_TAG="${BUILD_NUMBER}"
        CLUSTER_NAME="my-cluster"  // Make sure this matches your EKS cluster name
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
                        // Configure kubectl
                        sh """
                        aws eks get-token --cluster-name ${CLUSTER_NAME} | kubectl apply -f -
                        aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_DEFAULT_REGION}
                        """
                        
                        // Apply Kubernetes manifests
                        sh """
                        sed -i 's|FRONTEND_IMAGE|${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${FRONTEND_REPO_NAME}:${IMAGE_TAG}|' k8s/frontend-deployment.yaml
                        sed -i 's|BACKEND_IMAGE|${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${BACKEND_REPO_NAME}:${IMAGE_TAG}|' k8s/backend-deployment.yaml
                        kubectl apply -f k8s/mongodb-deployment.yaml --validate=false
                        kubectl apply -f k8s/backend-deployment.yaml --validate=false
                        kubectl apply -f k8s/frontend-deployment.yaml --validate=false
                        kubectl apply -f k8s/mongodb-service.yaml --validate=false
                        kubectl apply -f k8s/backend-service.yaml --validate=false
                        kubectl apply -f k8s/frontend-service.yaml --validate=false
                        """
                    }
                }
            }
        }
    }
}
