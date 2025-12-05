/**
 * Migration script from Firestore to SQL Server
 * 
 * This script helps migrate data from your existing Firestore database
 * to the new SQL Server database.
 */

import admin from 'firebase-admin';
import { getPool } from './connection';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Initialize Firebase Admin
const serviceAccount = require('../../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

interface FirestoreUser {
  email: string;
  name: string;
  role: string;
  [key: string]: any;
}

interface FirestoreStudent {
  userId: string;
  studentCode: string;
  classId?: string;
  majorId?: string;
  [key: string]: any;
}

async function migrateUsers() {
  console.log('Starting users migration...');
  
  const usersSnapshot = await db.collection('users').get();
  const pool = getPool();
  
  let count = 0;
  
  for (const doc of usersSnapshot.docs) {
    const data = doc.data() as FirestoreUser;
    
    try {
      // Generate a default password (users will need to reset)
      const defaultPassword = await bcrypt.hash('ChangeMe123!', 12);
      
      await pool
        .request()
        .input('id', doc.id)
        .input('email', data.email)
        .input('password_hash', defaultPassword)
        .input('full_name', data.name || data.fullName || 'Unknown')
        .input('role', data.role || 'student')
        .input('phone', data.phone || null)
        .input('avatar_url', data.avatarUrl || data.photoURL || null)
        .query(`
          INSERT INTO users (id, email, password_hash, full_name, role, phone, avatar_url)
          VALUES (@id, @email, @password_hash, @full_name, @role, @phone, @avatar_url)
        `);
      
      count++;
    } catch (error) {
      console.error(`Error migrating user ${doc.id}:`, error);
    }
  }
  
  console.log(`✅ Migrated ${count} users`);
}

async function migrateStudents() {
  console.log('Starting students migration...');
  
  const studentsSnapshot = await db.collection('students').get();
  const pool = getPool();
  
  let count = 0;
  
  for (const doc of studentsSnapshot.docs) {
    const data = doc.data() as FirestoreStudent;
    
    try {
      await pool
        .request()
        .input('id', doc.id)
        .input('user_id', data.userId)
        .input('student_code', data.studentCode)
        .input('class_id', data.classId || null)
        .input('major_id', data.majorId || null)
        .input('gpa', data.gpa || null)
        .input('status', data.status || 'active')
        .query(`
          INSERT INTO students (id, user_id, student_code, class_id, major_id, gpa, status)
          VALUES (@id, @user_id, @student_code, @class_id, @major_id, @gpa, @status)
        `);
      
      count++;
    } catch (error) {
      console.error(`Error migrating student ${doc.id}:`, error);
    }
  }
  
  console.log(`✅ Migrated ${count} students`);
}

async function migrateTopics() {
  console.log('Starting topics migration...');
  
  const topicsSnapshot = await db.collection('topics').get();
  const pool = getPool();
  
  let count = 0;
  
  for (const doc of topicsSnapshot.docs) {
    const data = doc.data();
    
    try {
      await pool
        .request()
        .input('title', data.title)
        .input('description', data.description || null)
        .input('student_id', data.studentId || null)
        .input('supervisor_id', data.supervisorId || null)
        .input('company_id', data.companyId || null)
        .input('topic_type', data.topicType || data.type || null)
        .input('status', data.status || 'pending')
        .input('major_id', data.majorId || null)
        .query(`
          INSERT INTO topics (title, description, student_id, supervisor_id, company_id, topic_type, status, major_id)
          VALUES (@title, @description, @student_id, @supervisor_id, @company_id, @topic_type, @status, @major_id)
        `);
      
      count++;
    } catch (error) {
      console.error(`Error migrating topic ${doc.id}:`, error);
    }
  }
  
  console.log(`✅ Migrated ${count} topics`);
}

async function migrateConversations() {
  console.log('Starting conversations migration...');
  
  const conversationsSnapshot = await db.collection('conversations').get();
  const pool = getPool();
  
  let conversationCount = 0;
  let messageCount = 0;
  
  for (const doc of conversationsSnapshot.docs) {
    const data = doc.data();
    
    try {
      // Insert conversation
      const result = await pool
        .request()
        .input('subject', data.subject)
        .input('created_by', data.participantIds?.[0] || null)
        .input('last_message_at', data.lastMessageAt?.toDate() || null)
        .input('last_message_snippet', data.lastMessageSnippet || null)
        .query(`
          INSERT INTO conversations (subject, created_by, last_message_at, last_message_snippet)
          OUTPUT INSERTED.id
          VALUES (@subject, @created_by, @last_message_at, @last_message_snippet)
        `);
      
      const conversationId = result.recordset[0].id;
      
      // Add participants
      if (data.participantIds && Array.isArray(data.participantIds)) {
        for (const participantId of data.participantIds) {
          await pool
            .request()
            .input('conversation_id', conversationId)
            .input('user_id', participantId)
            .input('has_read', data.readBy?.includes(participantId) || false)
            .query(`
              INSERT INTO conversation_participants (conversation_id, user_id, has_read)
              VALUES (@conversation_id, @user_id, @has_read)
            `);
        }
      }
      
      // Migrate messages subcollection
      const messagesSnapshot = await doc.ref.collection('messages').get();
      
      for (const msgDoc of messagesSnapshot.docs) {
        const msgData = msgDoc.data();
        
        try {
          await pool
            .request()
            .input('conversation_id', conversationId)
            .input('sender_id', msgData.senderId)
            .input('content', msgData.content)
            .input('created_at', msgData.createdAt?.toDate() || null)
            .query(`
              INSERT INTO messages (conversation_id, sender_id, content, created_at)
              VALUES (@conversation_id, @sender_id, @content, @created_at)
            `);
          
          messageCount++;
        } catch (error) {
          console.error(`Error migrating message ${msgDoc.id}:`, error);
        }
      }
      
      conversationCount++;
    } catch (error) {
      console.error(`Error migrating conversation ${doc.id}:`, error);
    }
  }
  
  console.log(`✅ Migrated ${conversationCount} conversations and ${messageCount} messages`);
}

async function migrateResources() {
  console.log('Starting resources migration...');
  
  const resourcesSnapshot = await db.collection('resources').get();
  const pool = getPool();
  
  let count = 0;
  
  for (const doc of resourcesSnapshot.docs) {
    const data = doc.data();
    
    try {
      const result = await pool
        .request()
        .input('name', data.name)
        .input('summary', data.summary || null)
        .input('category', data.category)
        .input('resource_type', data.resourceType || 'document')
        .query(`
          INSERT INTO resources (name, summary, category, resource_type)
          OUTPUT INSERTED.id
          VALUES (@name, @summary, @category, @resource_type)
        `);
      
      const resourceId = result.recordset[0].id;
      
      // Add links
      if (data.links && Array.isArray(data.links)) {
        for (let i = 0; i < data.links.length; i++) {
          const link = data.links[i];
          await pool
            .request()
            .input('resource_id', resourceId)
            .input('label', link.label)
            .input('url', link.url)
            .input('order_index', i)
            .query(`
              INSERT INTO resource_links (resource_id, label, url, order_index)
              VALUES (@resource_id, @label, @url, @order_index)
            `);
        }
      }
      
      count++;
    } catch (error) {
      console.error(`Error migrating resource ${doc.id}:`, error);
    }
  }
  
  console.log(`✅ Migrated ${count} resources`);
}

async function runMigration() {
  try {
    console.log('🚀 Starting Firestore to SQL Server migration...\n');
    
    // Run migrations in order
    await migrateUsers();
    await migrateStudents();
    await migrateTopics();
    await migrateConversations();
    await migrateResources();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  Important: All users have been assigned the default password "ChangeMe123!"');
    console.log('   Please ask users to change their passwords immediately.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();
