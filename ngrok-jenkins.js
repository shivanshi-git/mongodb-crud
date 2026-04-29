const ngrok = require('@ngrok/ngrok');

(async function() {
  try {
    console.log("Starting ngrok for Jenkins (Port 8080)...");
    
    // We use the token you provided earlier to bypass the broken CLI
    const listener = await ngrok.forward({ 
      addr: 8080, 
      authtoken: '3D2sF85vvakVhijwD9QLj9JQK1T_4YSh4jNajbj49xukmq7JU' 
    });
    
    console.log(`\n✅ Jenkins is now exposed to the internet at:`);
    console.log(`👉 ${listener.url()}`);
    console.log(`\nCopy the URL above and paste it into GitHub with your webhook path!`);
    console.log(`Example: ${listener.url()}/github-webhook/`);
    
    // Keep the process running so the tunnel stays open!
    process.stdin.resume();
    
  } catch (err) {
    console.error('Error:', err);
  }
})();
