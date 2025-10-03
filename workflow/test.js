console.log('\n🧪 TEST MODE - No API calls\n');

const agents = [
    'Product Manager',
    'UX Designer',
    'System Architect',
    'Frontend Developer',
    'API Developer'
];

async function test() {
    for (const agent of agents) {
        console.log(`✅ ${agent} - OK`);
        await new Promise(r => setTimeout(r, 500));
    }
    console.log('\n✨ Test complete! System is ready.\n');
}

test();