const { spawn } = require('child_process');
const path = require('path');

class ImageAnalysisService {
  async analyzeImage(imageUrl, description = '') {
    return new Promise((resolve, reject) => {
      try {
        // Path to the Python prediction script
        const scriptPath = path.join(__dirname, '../../ml/scripts/predict_model.py');

        // Spawn Python process
        const pythonProcess = spawn('python3', [scriptPath, imageUrl, description], {
          cwd: path.join(__dirname, '../../ml')
        });

        let result = '';
        let errorOutput = '';

        // Collect stdout
        pythonProcess.stdout.on('data', (data) => {
          result += data.toString();
        });

        // Collect stderr
        pythonProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const parsedResult = JSON.parse(result.trim());
              resolve(parsedResult.isRelevant || false);
            } catch (parseError) {
              console.error('Error parsing Python output:', parseError);
              // Fallback: check description for sewage-related keywords
              resolve(this.fallbackAnalysis(description));
            }
          } else {
            console.error('Python process failed with code:', code);
            console.error('Error output:', errorOutput);
            // Fallback analysis
            resolve(this.fallbackAnalysis(description));
          }
        });

        // Handle process errors
        pythonProcess.on('error', (error) => {
          console.error('Failed to start Python process:', error);
          // Fallback analysis
          resolve(this.fallbackAnalysis(description));
        });

        // Timeout after 30 seconds
        setTimeout(() => {
          pythonProcess.kill();
          console.log('Image analysis timed out, using fallback');
          resolve(this.fallbackAnalysis(description));
        }, 30000);

      } catch (error) {
        console.error('Error in image analysis:', error);
        // Fallback analysis
        resolve(this.fallbackAnalysis(description));
      }
    });
  }

  fallbackAnalysis(description = '') {
    // Simple keyword-based analysis as fallback
    const sewageKeywords = [
      'sewage', 'sewer', 'drain', 'pipe', 'leak', 'overflow', 'spill',
      'wastewater', 'manhole', 'plumbing', 'toilet', 'sink', 'bathroom',
      'water damage', 'flood', 'puddle', 'mud', 'dirt', 'contamination'
    ];

    const lowerDescription = description.toLowerCase();
    return sewageKeywords.some(keyword => lowerDescription.includes(keyword));
  }
}

module.exports = ImageAnalysisService;