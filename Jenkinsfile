pipeline {
  agent { label 'docker-agent' }

  tools {
    nodejs 'NodeJS_18'  
  }

  environment {
    MONGO_URI = credentials('MONGO_URI')
    OPENAI_API_KEY = credentials('OPENAI_API_KEY')
  }

  stages {

    stage('Confirm Agent') {
      steps {
        bat 'echo Running on the docker-agent!'
        bat 'whoami'
        bat 'docker --version'
        bat 'node -v'
        bat 'npm -v'
      }
    }

    stage('Checkout Code') {
      steps {
        echo '🔄 Checking out code from GitHub...'
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        echo '📦 Installing Node.js packages...'
        bat 'npm install'
      }
    }

    stage('Run Tests') {
      steps {
        echo '🧪 Running Jest tests using npm script...'
        bat 'npm run test --if-present'
      }
    }

    stage('Check Where Jenkins Runs') {
      steps {
        bat '''
          ver
          systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
        '''
      }
    }

    stage('Test Docker Access') {
      steps {
        bat 'docker version'
      }
    }

    stage('Build Docker Image') {
      steps {
        echo '🐳 Building Docker image...'
        bat 'docker build -t tominjose/interviewgenie .'
      }
    }

    stage('Deploy Container (Test)') {
      steps {
        echo '🚀 Deploying app in test container...'
        bat '''
          docker rm -f interviewgenie-test || exit 0
          docker run -d --name interviewgenie-test ^
            -p 3000:3000 ^
            -e MONGO_URI=%MONGO_URI% ^
            -e OPENAI_API_KEY=%OPENAI_API_KEY% ^
            tominjose/interviewgenie
        '''
      }
    }

  }

  post {
    always {
      echo '🧹 Pipeline completed.'
    }
    success {
      echo '✅ All steps succeeded!'
    }
    failure {
      echo '❌ Something went wrong.'
    }
  }
}
