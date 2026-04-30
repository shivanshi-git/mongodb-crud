pipeline {
    agent any

    stages {

        stage('Checkout') {
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

        stage('Test') {
            steps {
                echo 'Running tests...'
                // Uncomment when tests exist
                // bat 'npm test'
            }
        }

    }

    post {
        always {
            echo "Sending webhook notification to Node.js App via Ngrok..."

            powershell '''
            $body = @{
                name = "$env:JOB_NAME"
                build = @{
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