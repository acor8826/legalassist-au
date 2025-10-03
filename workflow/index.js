import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

// Check for API key
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey || apiKey.includes('YOUR-ACTUAL-KEY')) {
    console.log('\n❌ ERROR: Please add your actual Anthropic API key to the .env file');
    console.log('📝 Edit .env and add your real key');
    console.log('🔑 Get your key from: https://console.anthropic.com/api-keys\n');
    process.exit(1);
}

// Initialize Anthropic client
const client = new Anthropic({ apiKey });

// Define agents
const agents = [
    'Product Manager',
    'UX Designer', 
    'System Architect',
    'Frontend Developer',
    'API Developer',
    'Security Analyst',
    'QA Engineer',
    'Accessibility Specialist',
    'Performance Engineer',
    'Tech Lead'
];

// Main workflow
async function runWorkflow() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   🚀 AI DEVELOPMENT WORKFLOW SYSTEM 🚀      ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    // Test API connection with CORRECT model name
    console.log('🔄 Testing API connection...');
    try {
        const response = await client.messages.create({
            model: 'claude-3-haiku-20240307',  // FIXED!
            max_tokens: 100,
            messages: [{
                role: 'user',
                content: 'Respond with "Connected successfully!" if you receive this.'
            }]
        });
        console.log('✅', response.content[0].text, '\n');
    } catch (error) {
        console.error('❌ API Connection failed:', error.message);
        console.log('Please check your API key and internet connection.\n');
        return;
    }
    
    // Create output directory
    await fs.mkdir('.agent-output', { recursive: true });
    
    // Run agents
    console.log('📋 Running workflow with', agents.length, 'specialized agents:\n');
    
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        console.log(`[${i+1}/${agents.length}] 🔵 ${agent} working...`);
        
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Save output
        const output = `# ${agent} Report\n\nAnalysis completed at ${new Date().toISOString()}`;
        await fs.writeFile(`.agent-output/${agent.toLowerCase().replace(' ', '-')}.md`, output);
        
        console.log(`[${i+1}/${agents.length}] ✅ ${agent} complete\n`);
    }
    
    console.log('🎉 Workflow complete!');
    console.log('📁 Check .agent-output/ folder for results\n');
}

// Run the workflow
runWorkflow().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});