// This BAML file defines a function to extract contact information from conversation transcripts
// for community organization staff/representatives

// Define the Contact class structure
class Contact {
  name string @description("The contact's name, which may include first name only or both first and last names")
  title string @description("The contact's job title")
  department string @description("The contact's department")
  email string @description("The contact's email address")
  phone string @description("The contact's phone number in international format (e.g., '+12344567890'). Assume +1 for US when no country code is specified")
  phoneDescription string @description("A description of what to expect when calling this number (e.g., 'front desk', 'direct line', 'after-hours emergency line')")
  phoneExtension int @description("The contact's phone extension in integer format")
}

// Define the ContactInformation class which contains a list of contacts
class ContactInformation {
  contacts Contact[] @description("List of contact entries extracted from the transcript")
}

// Define the LLM function to extract contact information
function ExtractContactInformation(transcript: string) -> ContactInformation {
  // Specify which LLM client to use (you can define this in clients.baml)
  client CustomHaiku

  prompt #"
    {{ _.role("user") }}

    Extract contact information for community organization staff/representatives (not call center agents) from the following transcript. Follow these rules:

    Contact Information Rules:
    1. Data Requirements:
       - Include a contact entry if ANY of these are mentioned: name, email, or phone number
       - Phone numbers must be formatted with country code (default to +1 for US)
       - Extensions must be in integer format
       - Capture contextual information about phone numbers in the phoneDescription field, such as:
          * Whether it's a front desk, direct line, or general contact
          * Any specific guidance about when to use the number
          * Whether it's a personal or shared line
    
    2. Scope:
       - Only extract contact information for staff/representatives of the community organizations
       - Do NOT create entries for call center agents or other 211 staff
    
    Conversation Transcript:
    {{ transcript }}
    
    IMPORTANT: Respond ONLY with the structured data output. Do not include any additional text, explanations, or notes.

    {{ ctx.output_format }}
  "#
}

// Test example
test ContactInformationTest {
  functions [ExtractContactInformation]
  args {
    transcript #"
      Agent: Thank you for calling 211. My name is Alex. How can I help you today?
      
      Caller: Hi, I'm looking for housing assistance resources in Portland.
      
      Agent: I'd be happy to help. Let me connect you with Portland Housing Bureau. Their main line is 503-823-4000, and you can ask for Maria Johnson. She's the Outreach Coordinator in the Housing Support Department. Her direct line is 503-823-4567, extension 123. You can also email her at maria.johnson@portlandhousing.org.
    "#
  }
}

test DavidConversationTest {
  functions [ExtractContactInformation]
  args {
    transcript #"
      [BOT] Hello, I'm Jordan, the AI assistant for Two One One, a resource directory non-profit.
[BOT]  I'm reaching out to find the right contact at XYZ Community Services to answer some questions about your services.
[BOT]  Could you please let me know if there's someone who organizes services that our human experts could speak with?
[USER] Sure.
[USER] Would be David Bottos, spelled b o t o s His
[USER] phone number is six three zero four two seven seven one nine nine.
[USER] Email is david.m.bodice@gmail.com.
[BOT] Thank you so much for providing that information.
[BOT]  Just to confirm, the best contact for our human experts to reach out to would be David Bottos, and his contact information is six three zero four two seven seven one nine nine, and his email is david dot m dot botos at gmail dot com.
[BOT]  Could you please spell his last name again for me, I want to make sure I get it right.
[USER] B as in boy, o as in Oscar, t as in Tom, o as in Oscar, s as in Sam.
[BOT] Thank you for spelling that out for me, David.
[BOT]  So, to confirm, the correct spelling of his last name is indeed B-O-T-O-S. I appreciate you clarifying that for me.
[BOT]  Now, just to confirm his contact information one more time: David Bottos can be reached at six three zero four two seven seven one nine nine, and his email is david dot m dot botos at gmail dot com.
[BOT]  Are there any specific times or days when it's best for our human experts to reach out to him?
[USER] Yeah. Between 9AM and 2PM would be best.
[USER] On Fridays.
[BOT] So, to recap, the best contact for our human experts to reach out to is David Bottos, and his contact information is six three zero four two seven seven one nine nine, and his email is david dot m dot botos at gmail dot com.
[BOT]  He's available to talk between 9AM and 2PM on Fridays.
[BOT]  I really appreciate you taking the time to provide this information.
[BOT]  Is there anything else I should know about reaching out to David or XYZ Community Services?
[USER] Yep. This is alright.
[USER] I've gotta go.
[BOT] Thank you so much for your time and for providing the information about David Bottos.
[BOT]  I appreciate your help, and I'll make sure to pass this along to our human experts.
[BOT]  Have a great day, and goodbye!
    "#
  }
}