import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// The task we want to implement
const TASK = `
Add an "Add to Chat" button to the DocumentViewerModal component that:
- Appears in modal header toolbar
- Uses MessageSquarePlus icon from lucide-react
- Shows loading spinner while processing
- Sends document content to ChatGPT
- Shows success/error toast notifications
- Full accessibility support
`;

// Agent configurations
const agents = [
    {
        name: 'Product Manager',
        prompt: 'As a Product Manager, create user stories and acceptance criteria for this feature:',
        temperature: 0.3
    },
    {
        name: 'UX Designer',
        prompt: 'As a UX Designer, describe the visual design and user interaction flow for:',
        temperature: 0.5
    },
    {
        name: 'System Architect',
        prompt: 'As a System Architect, design the technical architecture and data flow for:',
        temperature: 0.2
    },
    {
        name: 'Frontend Developer',
        prompt: 'As a Frontend Developer, write the React component code for:',
        temperature: 0.6
    },
    {
        name: 'API Developer',
        prompt: 'As an API Developer, design the backend integration for:',
        temperature: 0.4
    },
    {
        name: 'Security Analyst',
        prompt: 'As a Security Analyst, identify security concerns and solutions for:',
        temperature: 0.1
    },
    {
        name: 'QA Engineer',
        prompt: 'As a QA Engineer, write test cases for:',
        temperature: 0.3
    },
    {
        name: 'Accessibility Specialist',
        prompt: 'As an Accessibility Specialist, ensure WCAG compliance for:',
        temperature: 0.2
    },
    {
        name: 'Performance Engineer',
        prompt: 'As a Performance Engineer, optimize the implementation of:',
        temperature: 0.3
    },
    {
        name: 'Tech Lead',
        prompt: 'As a Tech Lead, review and provide final recommendations for:',
        temperature: 0.2
    }
];

async function runAgent(agent, previousOutputs) {
    console.log(`🔵 [${agent.name}] Analyzing...`);
    
    try {
        // Build context from previous agents
        let context = TASK;
        if (previousOutputs.length > 0) {
            context += '\n\nPrevious analyses:\n';
            context += previousOutputs.slice(-3).join('\n'); // Include last 3 outputs for context
        }
        
        const response = await client.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            temperature: agent.temperature,
            messages: [{
                role: 'user',
                content: `${agent.prompt}\n\n${context}`
            }]
        });
        
        const output = response.content[0].text;
        
        // Save to file
        const filename = `.agent-output/${agent.name.toLowerCase().replace(' ', '-')}.md`;
        const fullOutput = `# ${agent.name} Analysis\n\n## Task\n${TASK}\n\n## Analysis\n${output}\n\n---\nGenerated: ${new Date().toISOString()}`;
        await fs.writeFile(filename, fullOutput);
        
        console.log(`✅ [${agent.name}] Complete\n`);
        
        return `[${agent.name}]: ${output.substring(0, 200)}...`; // Return summary for context
    } catch (error) {
        console.error(`❌ [${agent.name}] Error:`, error.message);
        return `[${agent.name}]: Error occurred`;
    }
}

async function runWorkflow() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     🚀 ADVANCED AI DEVELOPMENT WORKFLOW 🚀                  ║');
    console.log('║         Legal Document Chat Integration                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 Task:', TASK, '\n');
    
    await fs.mkdir('.agent-output', { recursive: true });
    
    const outputs = [];
    
    // Run each agent sequentially
    for (let i = 0; i < agents.length; i++) {
        console.log(`[${i+1}/${agents.length}] Processing with ${agents[i].name}...`);
        const output = await runAgent(agents[i], outputs);
        outputs.push(output);
        
        // Small delay to avoid rate limits
        if (i < agents.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // Create summary report
    console.log('📊 Creating summary report...\n');
    const summary = `# Workflow Summary\n\n## Task\n${TASK}\n\n## Agents Executed\n${agents.map(a => `- ✅ ${a.name}`).join('\n')}\n\n## Outputs Generated\nCheck individual files in .agent-output/ folder\n\n## Next Steps\n1. Review Tech Lead recommendations\n2. Implement Frontend Developer code\n3. Run QA Engineer test cases\n\nCompleted: ${new Date().toISOString()}`;
    
    await fs.writeFile('.agent-output/SUMMARY.md', summary);
    
    console.log('🎉 Advanced workflow complete!');
    console.log('📁 Outputs saved to .agent-output/');
    console.log('📄 Read SUMMARY.md for overview\n');
}

runWorkflow().catch(console.error);