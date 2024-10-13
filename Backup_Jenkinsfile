pipeline {
    agent any
    
    environment {
        AWS_ACCOUNT_ID="058264258551"
        AWS_DEFAULT_REGION="ap-south-1" 
        FRONTEND_REPO_NAME="three-tier-frontend"
        BACKEND_REPO_NAME="three-tier-backend"
        IMAGE_TAG="${BUILD_NUMBER}"
        CLUSTER_NAME="my-cluster"
        KUBECTL="/usr/local/bin/kubectl"
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

        stage('Check Permissions') {
            steps {
                sh '''
                    echo "Checking kubeconfig permissions:"
                    ls -l $HOME/.kube/config || echo "Kubeconfig not found"
                    
                    echo "Checking kubectl executable:"
                    which ${KUBECTL} || echo "kubectl not found in PATH"
                    
                    echo "Checking AWS CLI executable:"
                    which aws || echo "AWS CLI not found in PATH"
                '''
            }
        }
        
        stage('Deploy to EKS') {
            steps {
                withCredentials([aws(credentialsId: 'AWS_CREDS', accessKeyVariable: 'AWS_ACCESS_KEY_ID', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    script {
                        sh '''
                            set -x
                            echo "Current working directory: $(pwd)"
                            echo "Contents of current directory:"
                            ls -la
                            
                            echo "Kubectl version:"
                            ${KUBECTL} version --client || echo "Failed to get kubectl version"
                            
                            echo "Updating kubeconfig:"
                            aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_DEFAULT_REGION} || echo "Failed to update kubeconfig"
                            
                            echo "Kubectl config view:"
                            ${KUBECTL} config view --raw || echo "Failed to view kubectl config"
                            
                            echo "Kubectl get nodes:"
                            ${KUBECTL} get nodes || echo "Failed to get nodes"
                            
                            echo "Updating deployment files:"
                            sed -i 's|FRONTEND_IMAGE|${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${FRONTEND_REPO_NAME}:${IMAGE_TAG}|' k8s/frontend-deployment.yaml
                            sed -i 's|BACKEND_IMAGE|${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${BACKEND_REPO_NAME}:${IMAGE_TAG}|' k8s/backend-deployment.yaml
                            
                            echo "Applying MongoDB deployment:"
                            ${KUBECTL} apply -f k8s/mongodb-deployment.yaml || echo "Failed to apply MongoDB deployment"
                            
                            echo "Applying Backend deployment:"
                            ${KUBECTL} apply -f k8s/backend-deployment.yaml || echo "Failed to apply Backend deployment"
                            
                            echo "Applying Frontend deployment:"
                            ${KUBECTL} apply -f k8s/frontend-deployment.yaml || echo "Failed to apply Frontend deployment"
                            
                            echo "Applying MongoDB service:"
                            ${KUBECTL} apply -f k8s/mongodb-service.yaml || echo "Failed to apply MongoDB service"
                            
                            echo "Applying Backend service:"
                            ${KUBECTL} apply -f k8s/backend-service.yaml || echo "Failed to apply Backend service"
                            
                            echo "Applying Frontend service:"
                            ${KUBECTL} apply -f k8s/frontend-service.yaml || echo "Failed to apply Frontend service"
                            
                            echo "Deployment completed"
                        '''
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    sh '''
                        echo "Checking deployments:"
                        ${KUBECTL} get deployments
                        
                        echo "Checking services:"
                        ${KUBECTL} get services
                        
                        echo "Checking pods:"
                        ${KUBECTL} get pods
                        
                        echo "Describing services for external IPs:"
                        ${KUBECTL} describe services frontend-service
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo 'Printing kubectl config and AWS CLI config for debugging'
            sh '''
                ${KUBECTL} config view --raw
                aws configure list
            '''
        }
        success {
            echo 'Deployment successful! Your application should now be accessible.'
        }
        failure {
            echo 'Deployment failed. Please check the logs for more information.'
        }
    }
}
