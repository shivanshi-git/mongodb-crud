pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                bat 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                // Uncomment when you add tests
                // bat 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                bat 'docker-compose build'
            }
        }

        stage('Deploy Containers') {
            steps {
                echo 'Deploying containers...'
                bat 'docker-compose up -d'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Checking running containers...'
                bat 'docker ps'
            }
        }
    }

    post {
        always {
            echo "Sending webhook notification to Node.js Dashboard..."

            powershell '''
            $body = @{
                name = "$env:JOB_NAME"
                build = @{
                    number = "$env:BUILD_NUMBER"
                    status = "$env:BUILD_STATUS"
                }
            } | ConvertTo-Json -Compress

            Invoke-RestMethod `
                -Uri "https://rethink-reputably-query.ngrok-free.dev/api/jenkins-webhook" `
                -Method POST `
                -ContentType "application/json" `
                -Body $body
            '''
        }
    }
}