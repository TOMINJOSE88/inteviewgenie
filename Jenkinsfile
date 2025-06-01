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

    stage('Checkout Code') {
      steps {
        echo '🔄 Checking out code from GitHub...'
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        echo '📦 Installing Node.js packages...'
        sh 'npm install'
      }
    }

    stage('Run Tests') {
  steps {
    echo '✅ Giving Jest binary execute permissions...'
    sh 'chmod +x node_modules/.bin/jest'

    echo '🧪 Running Jest tests using npm script...'
    sh 'npm run test --if-present'
  }
}

stage('Check Where Jenkins Runs') {
  steps {
    sh 'uname -a || systeminfo'
  }
}


    stage('Test Docker Access') {
      steps {
        sh 'docker version'
      }
    }


    stage('Build Docker Image') {
      steps {
        echo '🐳 Building Docker image...'
        sh 'docker build -t tominjose/interviewgenie .'
      }
    }

    stage('Deploy Container (Test)') {
  steps {
    echo '🚀 Deploying app in test container...'
    sh '''
      docker rm -f interviewgenie-test || true
      docker run -d --name interviewgenie-test \
        -p 3000:3000 \
        -e MONGO_URI=$MONGO_URI \
        -e OPENAI_API_KEY=$OPENAI_API_KEY \
        tominjose/interviewgenie
    '''
  }
}

  }
}
