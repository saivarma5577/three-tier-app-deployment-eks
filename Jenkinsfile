pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'ap-south-1'
        CLUSTER_NAME = 'my-app-cluster'
        KUBECONFIG = "${env.WORKSPACE}/kubeconfig"
    }

    stages {
        stage('Setup kubectl') {
            steps {
                script {
                    withAWS(credentials: 'aws-credentials', region: AWS_DEFAULT_REGION) {
                        sh """
                        aws eks get-token --cluster-name ${CLUSTER_NAME} > /dev/null 2>&1 || eksctl create cluster --name=${CLUSTER_NAME} --region=${AWS_DEFAULT_REGION} --nodes=2 --node-type=t3.medium
                        aws eks update-kubeconfig --name ${CLUSTER_NAME} --kubeconfig ${KUBECONFIG}
                        kubectl --kubeconfig=${KUBECONFIG} get nodes
                        """
                    }
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    try {
                        withAWS(credentials: 'aws-credentials', region: AWS_DEFAULT_REGION) {
                            sh """
                            kubectl --kubeconfig=${KUBECONFIG} delete deployment --all
                            kubectl --kubeconfig=${KUBECONFIG} get services | grep -v kubernetes | awk '{print \$1}' | xargs kubectl --kubeconfig=${KUBECONFIG} delete service
                            kubectl --kubeconfig=${KUBECONFIG} delete pod --all
                            kubectl --kubeconfig=${KUBECONFIG} delete pvc --all
                            kubectl --kubeconfig=${KUBECONFIG} delete configmap --all --ignore-not-found=true
                            kubectl --kubeconfig=${KUBECONFIG} delete secret --all --ignore-not-found=true
                            """
                        }
                    } catch (Exception e) {
                        echo "Cleanup failed, but continuing: ${e.getMessage()}"
                    }
                }
            }
        }
        stage('Build and Push Docker Images') {
    steps {
        script {
            withAWS(credentials: 'aws-credentials', region: AWS_DEFAULT_REGION) {
                sh """
                # Login to ECR
                aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin 058264258551.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com

                # Build and push backend image
                docker build -t three-tier-backend:latest ./backend
                docker tag three-tier-backend:latest 058264258551.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/three-tier-backend:latest
                docker push 058264258551.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/three-tier-backend:latest

                # Build and push frontend image
                docker build -t three-tier-frontend:latest ./frontend
                docker tag three-tier-frontend:latest 058264258551.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/three-tier-frontend:latest
                docker push 058264258551.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/three-tier-frontend:latest
                """
            }
        }
    }
}

        stage('Deploy Application') {
            steps {
                script {
                    withAWS(credentials: 'aws-credentials', region: AWS_DEFAULT_REGION) {
                        sh """
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/mongodb-deployment.yaml
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/backend-deployment.yaml
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/frontend-deployment.yaml
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/mongodb-service.yaml
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/backend-service.yaml
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/frontend-service.yaml
                        """
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    withAWS(credentials: 'aws-credentials', region: AWS_DEFAULT_REGION) {
                        sh """
                        kubectl --kubeconfig=${KUBECONFIG} get pods
                        kubectl --kubeconfig=${KUBECONFIG} get services
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
