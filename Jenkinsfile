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

    stage('Test Stage') {
  steps {
    echo '🧪 Running tests...'
    bat 'npm run test --if-present'
  }
}

    

    stage('Code Quality Stage') {
  steps {
    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
      bat 'npx sonar-scanner'
    }
  }
}

stage('Security Stage') {
  steps {
    echo '🔐 Installing and running Snyk for vulnerability analysis...'
    bat 'npm install -g snyk'
    
    withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
      bat 'snyk auth %SNYK_TOKEN%'
      bat 'snyk test --severity-threshold=high'
    }
  }
}



    stage('Build Stage') {
      steps {
        echo '🐳 Building Docker image...'
        bat 'docker build -t tominjose/interviewgenie .'
      }
    }

   stage('Deploy Stage') {
  steps {
    echo '🚀 Deploying app in test container...'
    bat '''
      docker rm -f interviewgenie-test || exit 0
      docker run -d --name interviewgenie-test ^
        -p 3000:3000 ^
        -e MONGO_URI="%MONGO_URI%" ^
        -e OPENAI_API_KEY="%OPENAI_API_KEY%" ^
        tominjose/interviewgenie
    '''
  }
}

stage('Release Stage') {
  when {
    branch 'main'  // Only run on main branch (optional safety)
  }
  steps {
    echo '🚀 Releasing to Production...'

    // Optional: Tag your code as a release version (if Git credentials are set)
    sh 'git config user.email "jenkins@yourdomain.com"'
    sh 'git config user.name "Jenkins CI"'
    sh 'git tag -a v1.0.${BUILD_NUMBER} -m "Release v1.0.${BUILD_NUMBER}" || true'
    sh 'git push origin --tags || true'

    // Build production image with tag
    sh "docker build -t tominjose/interviewgenie:prod-${BUILD_NUMBER} ."

    // Simulate production deploy
    sh '''
      docker rm -f interviewgenie-prod || true
      docker run -d --name interviewgenie-prod \
        -p 4000:3000 \
        -e MONGO_URI=$MONGO_URI \
        -e OPENAI_API_KEY=$OPENAI_API_KEY \
        tominjose/interviewgenie:prod-${BUILD_NUMBER}
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
