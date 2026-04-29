pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                // If you connect this to GitHub, Jenkins will automatically checkout your code.
                // checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                // Assuming your Jenkins agent is running on Windows (since you're using PowerShell locally)
                bat 'npm install'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // You can add your testing scripts here later
                // bat 'npm test'
            }
        }
    }

    post {
        always {
            echo "Sending webhook notification to Node.js App via Ngrok..."
            
            // Note: Since Ngrok free URLs change every time you restart your server,
            // you must update the URL below to match whatever URL your console printed!
            
            powershell """
            \$body = @{
                name = '${env.JOB_NAME}'
                build = @{
                    status = '${currentBuild.currentResult}'
                }
            } | ConvertTo-Json -Compress
            
            Invoke-RestMethod -Uri "https://rethink-reputably-query.ngrok-free.dev/api/jenkins-webhook" `
                              -Method POST `
                              -Headers @{"Content-Type"="application/json"; "ngrok-skip-browser-warning"="true"} `
                              -Body \$body
            """
        }
    }
}
