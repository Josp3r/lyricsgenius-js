// 代理配置示例
import { Genius } from '../dist/index.js';

async function proxyExample() {
  const token = process.env.GENIUS_ACCESS_TOKEN;
  
  if (!token) {
    console.error('Please set GENIUS_ACCESS_TOKEN environment variable');
    process.exit(1);
  }

  // 示例1: 自动检测代理（推荐）
  console.log('🌐 Example 1: Auto-detect proxy');
  try {
    const genius1 = new Genius({
      accessToken: token,
      verbose: true
    });
    
    const result1 = await genius1.searchAll('test');
    console.log('✅ Auto-detect proxy: Success');
    
  } catch (error) {
    console.log('❌ Auto-detect proxy failed:', error.message);
  }

  // 示例2: 明确指定SOCKS代理
  console.log('\n🌐 Example 2: Explicit SOCKS proxy');
  try {
    const genius2 = new Genius({
      accessToken: token,
      proxy: {
        host: '127.0.0.1',
        port: 7890,
        type: 'socks'
      },
      verbose: true
    });
    
    const result2 = await genius2.searchAll('test');
    console.log('✅ SOCKS proxy: Success');
    
  } catch (error) {
    console.log('❌ SOCKS proxy failed:', error.message);
  }

  // 示例3: HTTP代理
  console.log('\n🌐 Example 3: HTTP proxy');
  try {
    const genius3 = new Genius({
      accessToken: token,
      proxy: {
        host: '127.0.0.1',
        port: 8080,
        type: 'http'
      },
      verbose: true
    });
    
    const result3 = await genius3.searchAll('test');
    console.log('✅ HTTP proxy: Success');
    
  } catch (error) {
    console.log('❌ HTTP proxy failed:', error.message);
  }
}

proxyExample();