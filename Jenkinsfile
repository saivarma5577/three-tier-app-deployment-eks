pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'ap-south-1'
        CLUSTER_NAME = 'my-app-cluster'
        KUBECONFIG = "${env.WORKSPACE}/kubeconfig"
    }

    stages {
        stage('Cleanup') {
            steps {
                script {
                    try {
                        sh """
                        export KUBECONFIG=${KUBECONFIG}
                        kubectl delete deployment --all
                        kubectl get services | grep -v kubernetes | awk '{print \$1}' | xargs kubectl delete service
                        kubectl delete pod --all
                        kubectl delete pvc --all
                        kubectl delete configmap --all --ignore-not-found=true
                        kubectl delete secret --all --ignore-not-found=true
                        """
                    } catch (Exception e) {
                        echo "Cleanup failed, but continuing: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Create/Update EKS Cluster') {
            steps {
                script {
                    withAWS(credentials: 'aws-credentials', region: AWS_DEFAULT_REGION) {
                        sh """
                        eksctl create cluster --name=${CLUSTER_NAME} --region=${AWS_DEFAULT_REGION} --nodes=2 --node-type=t3.medium || true
                        aws eks get-token --cluster-name ${CLUSTER_NAME} | kubectl apply -f -
                        """
                    }
                }
            }
        }

        stage('Configure kubectl') {
            steps {
                script {
                    withAWS(credentials: 'aws-credentials', region: AWS_DEFAULT_REGION) {
                        sh "aws eks get-token --cluster-name ${CLUSTER_NAME} | kubectl apply -f -"
                        sh "aws eks update-kubeconfig --name ${CLUSTER_NAME} --kubeconfig ${KUBECONFIG}"
                    }
                }
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    withAWS(credentials: 'aws-credentials', region: AWS_DEFAULT_REGION) {
                        sh """
                        export KUBECONFIG=${KUBECONFIG}
                        kubectl apply -f k8s/mongodb-deployment.yaml
                        kubectl apply -f k8s/backend-deployment.yaml
                        kubectl apply -f k8s/frontend-deployment.yaml
                        kubectl apply -f k8s/mongodb-service.yaml
                        kubectl apply -f k8s/backend-service.yaml
                        kubectl apply -f k8s/frontend-service.yaml
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
                        export KUBECONFIG=${KUBECONFIG}
                        kubectl get pods
                        kubectl get services
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
