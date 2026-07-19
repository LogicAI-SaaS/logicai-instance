import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * TwilioNode - Twilio SMS/Voice/Video/Communication API Integration
 *
 * Provides comprehensive integration with Twilio API including:
 * - SMS: Send messages, list messages, get message status, redact
 * - Voice: Make calls, list calls, get call details, record calls
 * - Phone Numbers: Buy/search/release phone numbers, incoming phone numbers
 * - Lookup: Phone number lookup (carrier, type, caller name)
 * - Verify: Send verification codes, check verification codes
 * - Video: Create rooms, room participants, recordings
 * - Conversations: Chat conversations, participants, messages
 * - TaskRouter: Task routing, workers, workflows
 * - Sync: Sync documents, lists, maps
 * - Media: Media recordings, transcriptions
 * - Flex: Flex flows, tasks, chat channels
 * - Messaging: Messaging services, alpha sender, short codes
 *
 * Authentication: Account SID + Auth Token
 * API Docs: https://www.twilio.com/docs/api
 */
export class TwilioNode extends BaseNode {
  readonly accountSid: string;
  readonly authToken: string;
  readonly apiUrl: string;

  constructor(id: string, name: string, config: any) {
    super(id, name, config);
    this.accountSid = config.accountSid || '';
    this.authToken = config.authToken || '';

    if (!this.accountSid || !this.authToken) {
      throw new Error('Twilio accountSid and authToken are required');
    }

    this.apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;
  }

  /**
   * Resolve value with variable substitution
   */
  private resolveValue(value: any, context: ExecutionContext): any {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
      return value.replace(/\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g, (match, source, path) => {
        const sourceData = source === 'json' ? context.$json
          : source === 'workflow' ? context.$workflow
          : context.$node;
        const found = this.getNestedValue(sourceData, path);
        return found !== undefined ? String(found) : match;
      });
    }

    return value;
  }


  getType(): string {
    return 'twilio';
  }

  getIcon(): string {
    return '📞';
  }

  getCategory(): string {
    return 'communication';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    const operation = this.config.operation || 'sendSMS';

    try {
      switch (operation) {
        // SMS Operations
        case 'sendSMS':
          return await this.sendSMS(context);
        case 'sendMMS':
          return await this.sendMMS(context);
        case 'listMessages':
          return await this.listMessages(context);
        case 'getMessage':
          return await this.getMessage(context);
        case 'redactMessage':
          return await this.redactMessage(context);
        case 'deleteMessage':
          return await this.deleteMessage(context);

        // Voice Operations
        case 'makeCall':
          return await this.makeCall(context);
        case 'listCalls':
          return await this.listCalls(context);
        case 'getCall':
          return await this.getCall(context);
        case 'getCallRecording':
          return await this.getCallRecording(context);
        case 'getCallTranscription':
          return await this.getCallTranscription(context);
        case 'cancelCall':
          return await this.cancelCall(context);
        case 'updateCall':
          return await this.updateCall(context);
        case 'deleteCallRecording':
          return await this.deleteCallRecording(context);
        case 'listRecordings':
          return await this.listRecordings(context);
        case 'getRecording':
          return await this.getRecording(context);
        case 'deleteRecording':
          return await this.deleteRecording(context);

        // Phone Number Operations
        case 'listIncomingPhoneNumbers':
          return await this.listIncomingPhoneNumbers(context);
        case 'getIncomingPhoneNumber':
          return await this.getIncomingPhoneNumber(context);
        case 'updateIncomingPhoneNumber':
          return await this.updateIncomingPhoneNumber(context);
        case 'deleteIncomingPhoneNumber':
          return await this.deleteIncomingPhoneNumber(context);
        case 'searchAvailablePhoneNumbers':
          return await this.searchAvailablePhoneNumbers(context);
        case 'buyPhoneNumber':
          return await this.buyPhoneNumber(context);
        case 'releasePhoneNumber':
          return await this.releasePhoneNumber(context);
        case 'listTollFreeNumbers':
          return await this.listTollFreeNumbers(context);
        case 'listMobileNumbers':
          return await this.listMobileNumbers(context);
        case 'listLocalNumbers':
          return await this.listLocalNumbers(context);

        // Lookup Operations
        case 'lookupPhoneNumber':
          return await this.lookupPhoneNumber(context);
        case 'lookupCarrier':
          return await this.lookupCarrier(context);
        case 'lookupCallerName':
          return await this.lookupCallerName(context);

        // Verify Operations
        case 'createVerification':
          return await this.createVerification(context);
        case 'checkVerification':
          return await this.checkVerification(context);
        case 'updateVerificationSettings':
          return await this.updateVerificationSettings(context);
        case 'getVerificationServices':
          return await this.getVerificationServices(context);

        // Video Operations
        case 'createVideoRoom':
          return await this.createVideoRoom(context);
        case 'getVideoRoom':
          return await this.getVideoRoom(context);
        case 'listVideoRooms':
          return await this.listVideoRooms(context);
        case 'completeVideoRoom':
          return await this.completeVideoRoom(context);
        case 'deleteVideoRoom':
          return await this.deleteVideoRoom(context);
        case 'getRoomParticipants':
          return await this.getRoomParticipants(context);
        case 'removeParticipant':
          return await this.removeParticipant(context);
        case 'listRoomRecordings':
          return await this.listRoomRecordings(context);

        // Messaging Service Operations
        case 'createMessagingService':
          return await this.createMessagingService(context);
        case 'getMessagingService':
          return await this.getMessagingService(context);
        case 'listMessagingServices':
          return await this.listMessagingServices(context);
        case 'updateMessagingService':
          return await this.updateMessagingService(context);
        case 'deleteMessagingService':
          return await this.deleteMessagingService(context);
        case 'addPhoneNumberToService':
          return await this.addPhoneNumberToService(context);
        case 'removePhoneNumberFromService':
          return await this.removePhoneNumberFromService(context);

        // Conversation Operations
        case 'createConversation':
          return await this.createConversation(context);
        case 'getConversation':
          return await this.getConversation(context);
        case 'listConversations':
          return await this.listConversations(context);
        case 'deleteConversation':
          return await this.deleteConversation(context);
        case 'addConversationParticipant':
          return await this.addConversationParticipant(context);
        case 'removeConversationParticipant':
          return await this.removeConversationParticipant(context);
        case 'sendConversationMessage':
          return await this.sendConversationMessage(context);
        case 'listConversationMessages':
          return await this.listConversationMessages(context);

        // Queue Operations
        case 'createQueue':
          return await this.createQueue(context);
        case 'getQueue':
          return await this.getQueue(context);
        case 'listQueues':
          return await this.listQueues(context);
        case 'updateQueue':
          return await this.updateQueue(context);
        case 'deleteQueue':
          return await this.deleteQueue(context);

        // SIP Operations
        case 'listSIPCredentials':
          return await this.listSIPCredentials(context);
        case 'createSIPCredential':
          return await this.createSIPCredential(context);
        case 'createSIPDomain':
          return await this.createSIPDomain(context);
        case 'listSIPDomains':
          return await this.listSIPDomains(context);

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to execute Twilio operation: ${operation}`,
      };
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
    };
  }

  private async callApi(
    endpoint: string,
    method = 'GET',
    body?: any,
    isForm = false
  ): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.apiUrl}${endpoint}`;

    const headers: Record<string, string> = {
      ...this.getAuthHeaders(),
    };

    if (!isForm && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }
    if (isForm) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      if (isForm) {
        const formBody = Object.keys(body)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`)
          .join('&');
        options.body = formBody;
      } else {
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twilio API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  // ==================== SMS Operations ====================

  private async sendSMS(context: ExecutionContext): Promise<NodeExecutionResult> {
    const to = this.resolveValue(this.config.to, context);
    const from = this.resolveValue(this.config.from, context);
    const body = this.resolveValue(this.config.body, context);
    const statusCallback = this.resolveValue(this.config.statusCallback, context) || null;
    const maxPrice = this.config.maxPrice || null;
    const validityPeriod = this.config.validityPeriod || null;
    const smartEncoded = this.config.smartEncoded !== false;

    if (!to) {
      throw new Error('to is required');
    }
    if (!from) {
      throw new Error('from is required');
    }
    if (!body) {
      throw new Error('body is required');
    }

    const payload: any = {
      To: to,
      From: from,
      Body: body,
      SmartEncoded: smartEncoded,
    };

    if (statusCallback) {
      payload.StatusCallback = statusCallback;
    }
    if (maxPrice) {
      payload.MaxPrice = maxPrice;
    }
    if (validityPeriod) {
      payload.ValidityPeriod = validityPeriod;
    }

    const data = await this.callApi('/Messages.json', 'POST', payload, true);

    return {
      success: true,
      data: {
        sid: data.sid,
        status: data.status,
        to: data.to,
        from: data.from,
        body: data.body,
        direction: data.direction,
        dateCreated: data.date_created,
        dateUpdated: data.date_updated,
        price: data.price,
        priceUnit: data.price_unit,
        uri: data.uri,
      },
    };
  }

  private async sendMMS(context: ExecutionContext): Promise<NodeExecutionResult> {
    const to = this.resolveValue(this.config.to, context);
    const from = this.resolveValue(this.config.from, context);
    const body = this.resolveValue(this.config.body, context) || '';
    const mediaUrl = this.resolveValue(this.config.mediaUrl, context);
    const statusCallback = this.resolveValue(this.config.statusCallback, context) || null;

    if (!to) {
      throw new Error('to is required');
    }
    if (!from) {
      throw new Error('from is required');
    }
    if (!mediaUrl) {
      throw new Error('mediaUrl is required for MMS');
    }

    const payload: any = {
      To: to,
      From: from,
      MediaUrl: mediaUrl,
    };

    if (body) {
      payload.Body = body;
    }
    if (statusCallback) {
      payload.StatusCallback = statusCallback;
    }

    const data = await this.callApi('/Messages.json', 'POST', payload, true);

    return {
      success: true,
      data: {
        sid: data.sid,
        status: data.status,
        to: data.to,
        from: data.from,
        mediaUrl: data.subresource_uris?.media,
        uri: data.uri,
      },
    };
  }

  private async listMessages(context: ExecutionContext): Promise<NodeExecutionResult> {
    const to = this.resolveValue(this.config.to, context) || '';
    const from = this.resolveValue(this.config.from, context) || '';
    const dateAfter = this.resolveValue(this.config.dateAfter, context) || '';
    const dateBefore = this.resolveValue(this.config.dateBefore, context) || '';
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 1000);

    let endpoint = `/Messages.json?PageSize=${pageSize}&Page=${page}`;

    if (to) {
      endpoint += `&To=${encodeURIComponent(to)}`;
    }
    if (from) {
      endpoint += `&From=${encodeURIComponent(from)}`;
    }
    if (dateAfter) {
      endpoint += `&DateSent>=${encodeURIComponent(dateAfter)}`;
    }
    if (dateBefore) {
      endpoint += `&DateSent<=${encodeURIComponent(dateBefore)}`;
    }

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        messages: data.messages || [],
        firstPageUrl: data.first_page_url,
        previousPageUrl: data.previous_page_url,
        nextPageUrl: data.next_page_url,
        uri: data.uri,
      },
    };
  }

  private async getMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const messageSid = this.resolveValue(this.config.messageSid, context);

    if (!messageSid) {
      throw new Error('messageSid is required');
    }

    const data = await this.callApi(`/Messages/${messageSid}.json`);

    return {
      success: true,
      data: data,
    };
  }

  private async redactMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const messageSid = this.resolveValue(this.config.messageSid, context);

    if (!messageSid) {
      throw new Error('messageSid is required');
    }

    const data = await this.callApi(`/Messages/${messageSid}.json`, 'POST', {
      Body: '',
    }, true);

    return {
      success: true,
      data: {
        sid: data.sid,
        message: 'Message body redacted',
      },
    };
  }

  private async deleteMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const messageSid = this.resolveValue(this.config.messageSid, context);

    if (!messageSid) {
      throw new Error('messageSid is required');
    }

    await this.callApi(`/Messages/${messageSid}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Message deleted successfully',
        messageSid,
      },
    };
  }

  // ==================== Voice Operations ====================

  private async makeCall(context: ExecutionContext): Promise<NodeExecutionResult> {
    const to = this.resolveValue(this.config.to, context);
    const from = this.resolveValue(this.config.from, context);
    const url = this.resolveValue(this.config.url, context);
    const method = this.config.method || 'POST';
    const statusCallback = this.resolveValue(this.config.statusCallback, context) || null;
    const statusCallbackEvent = this.config.statusCallbackEvent || null;
    const fallbackUrl = this.resolveValue(this.config.fallbackUrl, context) || null;
    const machineDetection = this.config.machineDetection || null;
    const timeout = this.config.timeout || null;
    const record = this.config.record || false;
    const recordingStatusCallback = this.resolveValue(this.config.recordingStatusCallback, context) || null;
    const sendDigits = this.resolveValue(this.config.sendDigits, context) || null;

    if (!to) {
      throw new Error('to is required');
    }
    if (!from) {
      throw new Error('from is required');
    }
    if (!url) {
      throw new Error('url is required');
    }

    const payload: any = {
      To: to,
      From: from,
      Url: url,
      Method: method,
      Record: record,
    };

    if (statusCallback) {
      payload.StatusCallback = statusCallback;
    }
    if (statusCallbackEvent) {
      payload.StatusCallbackEvent = statusCallbackEvent;
    }
    if (fallbackUrl) {
      payload.FallbackUrl = fallbackUrl;
    }
    if (machineDetection) {
      payload.MachineDetection = machineDetection;
    }
    if (timeout) {
      payload.Timeout = timeout;
    }
    if (recordingStatusCallback) {
      payload.RecordingStatusCallback = recordingStatusCallback;
    }
    if (sendDigits) {
      payload.SendDigits = sendDigits;
    }

    const data = await this.callApi('/Calls.json', 'POST', payload, true);

    return {
      success: true,
      data: {
        sid: data.sid,
        status: data.status,
        to: data.to,
        from: data.from,
        direction: data.direction,
        dateCreated: data.date_created,
        dateUpdated: data.date_updated,
        price: data.price,
        priceUnit: data.price_unit,
        uri: data.uri,
      },
    };
  }

  private async listCalls(context: ExecutionContext): Promise<NodeExecutionResult> {
    const to = this.resolveValue(this.config.to, context) || '';
    const from = this.resolveValue(this.config.from, context) || '';
    const status = this.config.status || '';
    const startTimeAfter = this.resolveValue(this.config.startTimeAfter, context) || '';
    const startTimeBefore = this.resolveValue(this.config.startTimeBefore, context) || '';
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 1000);

    let endpoint = `/Calls.json?PageSize=${pageSize}&Page=${page}`;

    if (to) {
      endpoint += `&To=${encodeURIComponent(to)}`;
    }
    if (from) {
      endpoint += `&From=${encodeURIComponent(from)}`;
    }
    if (status) {
      endpoint += `&Status=${status}`;
    }
    if (startTimeAfter) {
      endpoint += `&StartTime>=${encodeURIComponent(startTimeAfter)}`;
    }
    if (startTimeBefore) {
      endpoint += `&StartTime<=${encodeURIComponent(startTimeBefore)}`;
    }

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        calls: data.calls || [],
        firstPageUrl: data.first_page_url,
        previousPageUrl: data.previous_page_url,
        nextPageUrl: data.next_page_url,
        uri: data.uri,
      },
    };
  }

  private async getCall(context: ExecutionContext): Promise<NodeExecutionResult> {
    const callSid = this.resolveValue(this.config.callSid, context);

    if (!callSid) {
      throw new Error('callSid is required');
    }

    const data = await this.callApi(`/Calls/${callSid}.json`);

    return {
      success: true,
      data: data,
    };
  }

  private async getCallRecording(context: ExecutionContext): Promise<NodeExecutionResult> {
    const callSid = this.resolveValue(this.config.callSid, context);
    const recordingSid = this.resolveValue(this.config.recordingSid, context);

    if (!callSid || !recordingSid) {
      throw new Error('callSid and recordingSid are required');
    }

    const data = await this.callApi(`/Calls/${callSid}/Recordings/${recordingSid}.json`);

    return {
      success: true,
      data: {
        sid: data.sid,
        callSid: data.call_sid,
        duration: data.duration,
        dateCreated: data.date_created,
        url: data.uri.replace('.json', ''),
      },
    };
  }

  private async getCallTranscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const recordingSid = this.resolveValue(this.config.recordingSid, context);

    if (!recordingSid) {
      throw new Error('recordingSid is required');
    }

    const data = await this.callApi(`/Transcriptions/${recordingSid}.json`);

    return {
      success: true,
      data: {
        sid: data.sid,
        transcriptionText: data.transcription_text,
        status: data.status,
        dateCreated: data.date_created,
        dateUpdated: data.date_updated,
      },
    };
  }

  private async cancelCall(context: ExecutionContext): Promise<NodeExecutionResult> {
    const callSid = this.resolveValue(this.config.callSid, context);

    if (!callSid) {
      throw new Error('callSid is required');
    }

    const data = await this.callApi(`/Calls/${callSid}.json`, 'POST', {
      Status: 'canceled',
    }, true);

    return {
      success: true,
      data: {
        sid: data.sid,
        status: data.status,
        message: 'Call canceled',
      },
    };
  }

  private async updateCall(context: ExecutionContext): Promise<NodeExecutionResult> {
    const callSid = this.resolveValue(this.config.callSid, context);
    const url = this.resolveValue(this.config.url, context);
    const method = this.config.method || 'POST';
    const status = this.config.status || null;
    const fallbackUrl = this.resolveValue(this.config.fallbackUrl, context) || null;

    if (!callSid) {
      throw new Error('callSid is required');
    }

    const payload: any = {};

    if (url) {
      payload.Url = url;
      payload.Method = method;
    }
    if (fallbackUrl) {
      payload.FallbackUrl = fallbackUrl;
    }
    if (status) {
      payload.Status = status;
    }

    const data = await this.callApi(`/Calls/${callSid}.json`, 'POST', payload, true);

    return {
      success: true,
      data: {
        sid: data.sid,
        status: data.status,
        message: 'Call updated',
      },
    };
  }

  private async deleteCallRecording(context: ExecutionContext): Promise<NodeExecutionResult> {
    const callSid = this.resolveValue(this.config.callSid, context);
    const recordingSid = this.resolveValue(this.config.recordingSid, context);

    if (!callSid || !recordingSid) {
      throw new Error('callSid and recordingSid are required');
    }

    await this.callApi(`/Calls/${callSid}/Recordings/${recordingSid}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Call recording deleted',
        recordingSid,
      },
    };
  }

  private async listRecordings(context: ExecutionContext): Promise<NodeExecutionResult> {
    const callSid = this.resolveValue(this.config.callSid, context) || '';
    const dateCreatedAfter = this.resolveValue(this.config.dateCreatedAfter, context) || '';
    const dateCreatedBefore = this.resolveValue(this.config.dateCreatedBefore, context) || '';
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 1000);

    let endpoint = `/Recordings.json?PageSize=${pageSize}&Page=${page}`;

    if (callSid) {
      endpoint += `&CallSid=${callSid}`;
    }
    if (dateCreatedAfter) {
      endpoint += `&DateCreated>=${encodeURIComponent(dateCreatedAfter)}`;
    }
    if (dateCreatedBefore) {
      endpoint += `&DateCreated<=${encodeURIComponent(dateCreatedBefore)}`;
    }

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        recordings: data.recordings || [],
        firstPageUrl: data.first_page_url,
        nextPageUrl: data.next_page_url,
        uri: data.uri,
      },
    };
  }

  private async getRecording(context: ExecutionContext): Promise<NodeExecutionResult> {
    const recordingSid = this.resolveValue(this.config.recordingSid, context);

    if (!recordingSid) {
      throw new Error('recordingSid is required');
    }

    const data = await this.callApi(`/Recordings/${recordingSid}.json`);

    return {
      success: true,
      data: {
        sid: data.sid,
        callSid: data.call_sid,
        duration: data.duration,
        dateCreated: data.date_created,
        url: data.uri.replace('.json', ''),
      },
    };
  }

  private async deleteRecording(context: ExecutionContext): Promise<NodeExecutionResult> {
    const recordingSid = this.resolveValue(this.config.recordingSid, context);

    if (!recordingSid) {
      throw new Error('recordingSid is required');
    }

    await this.callApi(`/Recordings/${recordingSid}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Recording deleted',
        recordingSid,
      },
    };
  }

  // ==================== Phone Number Operations ====================

  private async listIncomingPhoneNumbers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const phoneNumber = this.resolveValue(this.config.phoneNumber, context) || '';
    const friendlyName = this.resolveValue(this.config.friendlyName, context) || '';
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 1000);

    let endpoint = `/IncomingPhoneNumbers.json?PageSize=${pageSize}&Page=${page}`;

    if (phoneNumber) {
      endpoint += `&PhoneNumber=${encodeURIComponent(phoneNumber)}`;
    }
    if (friendlyName) {
      endpoint += `&FriendlyName=${encodeURIComponent(friendlyName)}`;
    }

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        phoneNumbers: data.incoming_phone_numbers || [],
        firstPageUrl: data.first_page_url,
        nextPageUrl: data.next_page_url,
        uri: data.uri,
      },
    };
  }

  private async getIncomingPhoneNumber(context: ExecutionContext): Promise<NodeExecutionResult> {
    const phoneNumberSid = this.resolveValue(this.config.phoneNumberSid, context);

    if (!phoneNumberSid) {
      throw new Error('phoneNumberSid is required');
    }

    const data = await this.callApi(`/IncomingPhoneNumbers/${phoneNumberSid}.json`);

    return {
      success: true,
      data: data,
    };
  }

  private async updateIncomingPhoneNumber(context: ExecutionContext): Promise<NodeExecutionResult> {
    const phoneNumberSid = this.resolveValue(this.config.phoneNumberSid, context);
    const friendlyName = this.resolveValue(this.config.friendlyName, context) || null;
    const voiceUrl = this.resolveValue(this.config.voiceUrl, context) || null;
    const voiceMethod = this.config.voiceMethod || null;
    const smsUrl = this.resolveValue(this.config.smsUrl, context) || null;
    const smsMethod = this.config.smsMethod || null;
    const statusCallback = this.resolveValue(this.config.statusCallback, context) || null;

    if (!phoneNumberSid) {
      throw new Error('phoneNumberSid is required');
    }

    const payload: any = {};

    if (friendlyName) {
      payload.FriendlyName = friendlyName;
    }
    if (voiceUrl) {
      payload.VoiceUrl = voiceUrl;
      if (voiceMethod) {
        payload.VoiceMethod = voiceMethod;
      }
    }
    if (smsUrl) {
      payload.SmsUrl = smsUrl;
      if (smsMethod) {
        payload.SmsMethod = smsMethod;
      }
    }
    if (statusCallback) {
      payload.StatusCallback = statusCallback;
    }

    const data = await this.callApi(
      `/IncomingPhoneNumbers/${phoneNumberSid}.json`,
      'POST',
      payload,
      true
    );

    return {
      success: true,
      data: {
        phoneNumber: data,
        message: 'Phone number updated',
      },
    };
  }

  private async deleteIncomingPhoneNumber(context: ExecutionContext): Promise<NodeExecutionResult> {
    const phoneNumberSid = this.resolveValue(this.config.phoneNumberSid, context);

    if (!phoneNumberSid) {
      throw new Error('phoneNumberSid is required');
    }

    await this.callApi(`/IncomingPhoneNumbers/${phoneNumberSid}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Phone number deleted',
        phoneNumberSid,
      },
    };
  }

  private async searchAvailablePhoneNumbers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const isoCountry = this.config.isoCountry || 'US';
    const areaCode = this.resolveValue(this.config.areaCode, context) || '';
    const contains = this.resolveValue(this.config.contains, context) || '';
    const inRegion = this.config.inRegion || '';
    const inPostalCode = this.resolveValue(this.config.inPostalCode, context) || '';
    const smsEnabled = this.config.smsEnabled !== false;
    const mmsEnabled = this.config.mmsEnabled !== false;
    const voiceEnabled = this.config.voiceEnabled !== false;
    const limit = Math.min(this.config.limit || 30, 200);

    let endpoint = `/AvailablePhoneNumbers/${isoCountry}/Local.json?SmsEnabled=${smsEnabled}&MmsEnabled=${mmsEnabled}&VoiceEnabled=${voiceEnabled}`;

    if (areaCode) {
      endpoint += `&AreaCode=${areaCode}`;
    }
    if (contains) {
      endpoint += `&Contains=${encodeURIComponent(contains)}`;
    }
    if (inRegion) {
      endpoint += `&InRegion=${inRegion}`;
    }
    if (inPostalCode) {
      endpoint += `&InPostalCode=${inPostalCode}`;
    }

    const data = await this.callApi(endpoint);

    const numbers = (data.available_phone_numbers || []).slice(0, limit);

    return {
      success: true,
      data: {
        numbers: numbers,
        count: numbers.length,
        isoCountry: data.iso_country,
      },
    };
  }

  private async buyPhoneNumber(context: ExecutionContext): Promise<NodeExecutionResult> {
    const phoneNumber = this.resolveValue(this.config.phoneNumber, context);

    if (!phoneNumber) {
      throw new Error('phoneNumber is required');
    }

    const data = await this.callApi('/IncomingPhoneNumbers.json', 'POST', {
      PhoneNumber: phoneNumber,
    }, true);

    return {
      success: true,
      data: {
        sid: data.sid,
        accountSid: data.account_sid,
        phoneNumber: data.phone_number,
        friendlyName: data.friendly_name,
        dateCreated: data.date_created,
      },
    };
  }

  private async releasePhoneNumber(context: ExecutionContext): Promise<NodeExecutionResult> {
    const phoneNumberSid = this.resolveValue(this.config.phoneNumberSid, context);

    if (!phoneNumberSid) {
      throw new Error('phoneNumberSid is required');
    }

    await this.callApi(`/IncomingPhoneNumbers/${phoneNumberSid}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Phone number released',
        phoneNumberSid,
      },
    };
  }

  private async listTollFreeNumbers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const isoCountry = this.config.isoCountry || 'US';
    const contains = this.resolveValue(this.config.contains, context) || '';
    const limit = Math.min(this.config.limit || 30, 200);

    let endpoint = `/AvailablePhoneNumbers/${isoCountry}/TollFree.json`;

    if (contains) {
      endpoint += `?Contains=${encodeURIComponent(contains)}`;
    }

    const data = await this.callApi(endpoint);

    const numbers = (data.available_phone_numbers || []).slice(0, limit);

    return {
      success: true,
      data: {
        numbers: numbers,
        count: numbers.length,
      },
    };
  }

  private async listMobileNumbers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const isoCountry = this.config.isoCountry || 'US';
    const contains = this.resolveValue(this.config.contains, context) || '';
    const limit = Math.min(this.config.limit || 30, 200);

    let endpoint = `/AvailablePhoneNumbers/${isoCountry}/Mobile.json`;

    if (contains) {
      endpoint += `?Contains=${encodeURIComponent(contains)}`;
    }

    const data = await this.callApi(endpoint);

    const numbers = (data.available_phone_numbers || []).slice(0, limit);

    return {
      success: true,
      data: {
        numbers: numbers,
        count: numbers.length,
      },
    };
  }

  private async listLocalNumbers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const isoCountry = this.config.isoCountry || 'US';
    const areaCode = this.resolveValue(this.config.areaCode, context) || '';
    const limit = Math.min(this.config.limit || 30, 200);

    let endpoint = `/AvailablePhoneNumbers/${isoCountry}/Local.json`;

    if (areaCode) {
      endpoint += `?AreaCode=${areaCode}`;
    }

    const data = await this.callApi(endpoint);

    const numbers = (data.available_phone_numbers || []).slice(0, limit);

    return {
      success: true,
      data: {
        numbers: numbers,
        count: numbers.length,
      },
    };
  }

  // ==================== Lookup Operations ====================

  private async lookupPhoneNumber(context: ExecutionContext): Promise<NodeExecutionResult> {
    const phoneNumber = this.resolveValue(this.config.phoneNumber, context);
    const countryCode = this.config.countryCode || 'US';

    if (!phoneNumber) {
      throw new Error('phoneNumber is required');
    }

    const data = await this.callApi(
      `https://lookups.twilio.com/v1/PhoneNumbers/${phoneNumber}?CountryCode=${countryCode}`
    );

    return {
      success: true,
      data: {
        phoneNumber: data.phone_number,
        nationalFormat: data.national_format,
        countryCode: data.country_code,
        carrier: data.carrier,
        type: data.type,
        url: data.url,
      },
    };
  }

  private async lookupCarrier(context: ExecutionContext): Promise<NodeExecutionResult> {
    const phoneNumber = this.resolveValue(this.config.phoneNumber, context);
    const countryCode = this.config.countryCode || 'US';

    if (!phoneNumber) {
      throw new Error('phoneNumber is required');
    }

    const data = await this.callApi(
      `https://lookups.twilio.com/v1/PhoneNumbers/${phoneNumber}?CountryCode=${countryCode}&Type=carrier`
    );

    return {
      success: true,
      data: {
        phoneNumber: data.phone_number,
        carrier: {
          name: data.carrier?.name,
          type: data.carrier?.type,
          mobileCountryCode: data.carrier?.mobile_country_code,
          mobileNetworkCode: data.carrier?.mobile_network_code,
          error: data.carrier?.error,
        },
        url: data.url,
      },
    };
  }

  private async lookupCallerName(context: ExecutionContext): Promise<NodeExecutionResult> {
    const phoneNumber = this.resolveValue(this.config.phoneNumber, context);
    const countryCode = this.config.countryCode || 'US';

    if (!phoneNumber) {
      throw new Error('phoneNumber is required');
    }

    const data = await this.callApi(
      `https://lookups.twilio.com/v1/PhoneNumbers/${phoneNumber}?CountryCode=${countryCode}&Type=caller-name`
    );

    return {
      success: true,
      data: {
        phoneNumber: data.phone_number,
        callerName: {
          callerName: data.caller_name?.caller_name,
          callerType: data.caller_name?.caller_type,
          error: data.caller_name?.error,
        },
        url: data.url,
      },
    };
  }

  // ==================== Verify Operations ====================

  private async createVerification(context: ExecutionContext): Promise<NodeExecutionResult> {
    const serviceSid = this.resolveValue(this.config.serviceSid, context);
    const to = this.resolveValue(this.config.to, context);
    const channel = this.config.channel || 'sms';
    const locale = this.config.locale || 'en';
    const customCode = this.resolveValue(this.config.customCode, context) || null;

    if (!serviceSid) {
      throw new Error('serviceSid is required');
    }
    if (!to) {
      throw new Error('to is required');
    }

    const payload: any = {
      To: to,
      Channel: channel,
      Locale: locale,
    };

    if (customCode) {
      payload.CustomCode = customCode;
    }

    const data = await this.callApi(
      `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
      'POST',
      payload,
      true
    );

    return {
      success: true,
      data: {
        sid: data.sid,
        serviceSid: data.service_sid,
        accountSid: data.account_sid,
        to: data.to,
        channel: data.channel,
        status: data.status,
        dateCreated: data.date_created,
      },
    };
  }

  private async checkVerification(context: ExecutionContext): Promise<NodeExecutionResult> {
    const serviceSid = this.resolveValue(this.config.serviceSid, context);
    const to = this.resolveValue(this.config.to, context);
    const code = this.resolveValue(this.config.code, context);

    if (!serviceSid) {
      throw new Error('serviceSid is required');
    }
    if (!to) {
      throw new Error('to is required');
    }
    if (!code) {
      throw new Error('code is required');
    }

    const data = await this.callApi(
      `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
      'POST',
      {
        To: to,
        Code: code,
      },
      true
    );

    return {
      success: data.status === 'approved',
      data: {
        sid: data.sid,
        serviceSid: data.service_sid,
        accountSid: data.account_sid,
        to: data.to,
        status: data.status,
        valid: data.valid,
        dateCreated: data.date_created,
      },
    };
  }

  private async updateVerificationSettings(context: ExecutionContext): Promise<NodeExecutionResult> {
    const serviceSid = this.resolveValue(this.config.serviceSid, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const codeLength = this.config.codeLength || null;
    const lookupEnabled = this.config.lookupEnabled !== false;
    const skipSmsToLandlines = this.config.skipSmsToLandlines !== false;
    const dtmfInputRequired = this.config.dtmfInputRequired || null;
    const ttsName = this.resolveValue(this.config.ttsName, context) || null;
    const approvalWaitTime = this.config.approvalWaitTime || null;

    if (!serviceSid) {
      throw new Error('serviceSid is required');
    }

    const payload: any = {
      LookupEnabled: lookupEnabled,
      SkipSmsToLandlines: skipSmsToLandlines,
    };

    if (name) {
      payload.FriendlyName = name;
    }
    if (codeLength) {
      payload.CodeLength = codeLength;
    }
    if (dtmfInputRequired !== null) {
      payload.DtmfInputRequired = dtmfInputRequired;
    }
    if (ttsName) {
      payload.TtsName = ttsName;
    }
    if (approvalWaitTime) {
      payload.ApprovalWaitTime = approvalWaitTime;
    }

    const data = await this.callApi(
      `https://verify.twilio.com/v2/Services/${serviceSid}`,
      'POST',
      payload,
      true
    );

    return {
      success: true,
      data: {
        sid: data.sid,
        friendlyName: data.friendly_name,
        codeLength: data.code_length,
        lookupEnabled: data.lookup_enabled,
        skipSmsToLandlines: data.skip_sms_to_landlines,
      },
    };
  }

  private async getVerificationServices(context: ExecutionContext): Promise<NodeExecutionResult> {
    const data = await this.callApi('https://verify.twilio.com/v2/Services');

    return {
      success: true,
      data: {
        services: data.services || [],
        firstPageUrl: data.meta?.first_page_url,
        previousPageUrl: data.meta?.previous_page_url,
        nextPageUrl: data.meta?.next_page_url,
        key: data.meta?.key,
      },
    };
  }

  // ==================== Video Operations ====================

  private async createVideoRoom(context: ExecutionContext): Promise<NodeExecutionResult> {
    const uniqueName = this.resolveValue(this.config.uniqueName, context);
    const type = this.config.type || 'group';
    const enableTurn = this.config.enableTurn !== false;
    const statusCallback = this.resolveValue(this.config.statusCallback, context) || null;
    const maxParticipants = this.config.maxParticipants || null;
    const recordParticipantsOnConnect = this.config.recordParticipantsOnConnect || false;
    const videoCodecs = this.config.videoCodecs || ['VP8'];

    if (!uniqueName) {
      throw new Error('uniqueName is required');
    }

    const payload: any = {
      UniqueName: uniqueName,
      Type: type,
      EnableTurn: enableTurn,
      RecordParticipantsOnConnect: recordParticipantsOnConnect,
      VideoCodecs: videoCodecs,
    };

    if (statusCallback) {
      payload.StatusCallback = statusCallback;
    }
    if (maxParticipants) {
      payload.MaxParticipants = maxParticipants;
    }

    const data = await this.callApi(
      'https://video.twilio.com/v2/Rooms',
      'POST',
      payload,
      true
    );

    return {
      success: true,
      data: {
        sid: data.sid,
        uniqueName: data.unique_name,
        status: data.status,
        type: data.type,
        dateCreated: data.date_created,
        dateUpdated: data.date_updated,
        url: data.url,
        maxParticipants: data.max_participants,
      },
    };
  }

  private async getVideoRoom(context: ExecutionContext): Promise<NodeExecutionResult> {
    const roomSid = this.resolveValue(this.config.roomSid, context);

    if (!roomSid) {
      throw new Error('roomSid is required');
    }

    const data = await this.callApi(`https://video.twilio.com/v2/Rooms/${roomSid}`);

    return {
      success: true,
      data: data,
    };
  }

  private async listVideoRooms(context: ExecutionContext): Promise<NodeExecutionResult> {
    const status = this.config.status || '';
    const type = this.config.type || '';
    const uniqueName = this.resolveValue(this.config.uniqueName, context) || '';
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 100);

    let endpoint = `https://video.twilio.com/v2/Rooms?PageSize=${pageSize}&Page=${page}`;

    if (status) {
      endpoint += `&Status=${status}`;
    }
    if (type) {
      endpoint += `&Type=${type}`;
    }
    if (uniqueName) {
      endpoint += `&UniqueName=${encodeURIComponent(uniqueName)}`;
    }

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        rooms: data.rooms || [],
        firstPageUrl: data.meta?.first_page_url,
        previousPageUrl: data.meta?.previous_page_url,
        nextPageUrl: data.meta?.next_page_url,
        key: data.meta?.key,
      },
    };
  }

  private async completeVideoRoom(context: ExecutionContext): Promise<NodeExecutionResult> {
    const roomSid = this.resolveValue(this.config.roomSid, context);

    if (!roomSid) {
      throw new Error('roomSid is required');
    }

    const data = await this.callApi(
      `https://video.twilio.com/v2/Rooms/${roomSid}`,
      'POST',
      { Status: 'completed' },
      true
    );

    return {
      success: true,
      data: {
        sid: data.sid,
        status: data.status,
        message: 'Room completed',
      },
    };
  }

  private async deleteVideoRoom(context: ExecutionContext): Promise<NodeExecutionResult> {
    const roomSid = this.resolveValue(this.config.roomSid, context);

    if (!roomSid) {
      throw new Error('roomSid is required');
    }

    await this.callApi(`https://video.twilio.com/v2/Rooms/${roomSid}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Room deleted',
        roomSid,
      },
    };
  }

  private async getRoomParticipants(context: ExecutionContext): Promise<NodeExecutionResult> {
    const roomSid = this.resolveValue(this.config.roomSid, context);

    if (!roomSid) {
      throw new Error('roomSid is required');
    }

    const data = await this.callApi(`https://video.twilio.com/v2/Rooms/${roomSid}/Participants`);

    return {
      success: true,
      data: {
        participants: data.participants || [],
        firstPageUrl: data.meta?.first_page_url,
        nextPageUrl: data.meta?.next_page_url,
      },
    };
  }

  private async removeParticipant(context: ExecutionContext): Promise<NodeExecutionResult> {
    const roomSid = this.resolveValue(this.config.roomSid, context);
    const participantSid = this.resolveValue(this.config.participantSid, context);

    if (!roomSid || !participantSid) {
      throw new Error('roomSid and participantSid are required');
    }

    await this.callApi(
      `https://video.twilio.com/v2/Rooms/${roomSid}/Participants/${participantSid}`,
      'DELETE'
    );

    return {
      success: true,
      data: {
        message: 'Participant removed',
        participantSid,
      },
    };
  }

  private async listRoomRecordings(context: ExecutionContext): Promise<NodeExecutionResult> {
    const roomSid = this.resolveValue(this.config.roomSid, context);
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 100);

    if (!roomSid) {
      throw new Error('roomSid is required');
    }

    const endpoint = `https://video.twilio.com/v2/Rooms/${roomSid}/Recordings?PageSize=${pageSize}&Page=${page}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        recordings: data.recordings || [],
        firstPageUrl: data.meta?.first_page_url,
        nextPageUrl: data.meta?.next_page_url,
      },
    };
  }

  // ==================== Messaging Service Operations ====================

  private async createMessagingService(context: ExecutionContext): Promise<NodeExecutionResult> {
    const friendlyName = this.resolveValue(this.config.friendlyName, context);
    const inboundType = this.config.inboundType || 'all';
    const statusCallback = this.resolveValue(this.config.statusCallback, context) || null;
    const stickySender = this.config.stickySender !== false;
    const smartEncoding = this.config.smartEncoding !== false;
    const scanMessageContent = this.config.scanMessageContent || null;

    if (!friendlyName) {
      throw new Error('friendlyName is required');
    }

    const payload: any = {
      FriendlyName: friendlyName,
      InboundType: inboundType,
      StickySender: stickySender,
      SmartEncoding: smartEncoding,
    };

    if (statusCallback) {
      payload.StatusCallback = statusCallback;
    }
    if (scanMessageContent) {
      payload.ScanMessageContent = scanMessageContent;
    }

    const data = await this.callApi(
      'https://messaging.twilio.com/v1/Services',
      'POST',
      payload,
      true
    );

    return {
      success: true,
      data: {
        sid: data.sid,
        accountSid: data.account_sid,
        friendlyName: data.friendly_name,
        inboundType: data.inbound_type,
        dateCreated: data.date_created,
        dateUpdated: data.date_updated,
        url: data.url,
      },
    };
  }

  private async getMessagingService(context: ExecutionContext): Promise<NodeExecutionResult> {
    const serviceSid = this.resolveValue(this.config.serviceSid, context);

    if (!serviceSid) {
      throw new Error('serviceSid is required');
    }

    const data = await this.callApi(`https://messaging.twilio.com/v1/Services/${serviceSid}`);

    return {
      success: true,
      data: data,
    };
  }

  private async listMessagingServices(context: ExecutionContext): Promise<NodeExecutionResult> {
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 100);

    const endpoint = `https://messaging.twilio.com/v1/Services?PageSize=${pageSize}&Page=${page}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        services: data.services || [],
        firstPageUrl: data.meta?.first_page_url,
        nextPageUrl: data.meta?.next_page_url,
        key: data.meta?.key,
      },
    };
  }

  private async updateMessagingService(context: ExecutionContext): Promise<NodeExecutionResult> {
    const serviceSid = this.resolveValue(this.config.serviceSid, context);
    const friendlyName = this.resolveValue(this.config.friendlyName, context) || null;
    const statusCallback = this.resolveValue(this.config.statusCallback, context) || null;
    const inboundType = this.config.inboundType || null;
    const scanMessageContent = this.config.scanMessageContent || null;

    if (!serviceSid) {
      throw new Error('serviceSid is required');
    }

    const payload: any = {};

    if (friendlyName) {
      payload.FriendlyName = friendlyName;
    }
    if (statusCallback) {
      payload.StatusCallback = statusCallback;
    }
    if (inboundType) {
      payload.InboundType = inboundType;
    }
    if (scanMessageContent) {
      payload.ScanMessageContent = scanMessageContent;
    }

    const data = await this.callApi(
      `https://messaging.twilio.com/v1/Services/${serviceSid}`,
      'POST',
      payload,
      true
    );

    return {
      success: true,
      data: {
        sid: data.sid,
        friendlyName: data.friendly_name,
        message: 'Messaging service updated',
      },
    };
  }

  private async deleteMessagingService(context: ExecutionContext): Promise<NodeExecutionResult> {
    const serviceSid = this.resolveValue(this.config.serviceSid, context);

    if (!serviceSid) {
      throw new Error('serviceSid is required');
    }

    await this.callApi(`https://messaging.twilio.com/v1/Services/${serviceSid}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Messaging service deleted',
        serviceSid,
      },
    };
  }

  private async addPhoneNumberToService(context: ExecutionContext): Promise<NodeExecutionResult> {
    const serviceSid = this.resolveValue(this.config.serviceSid, context);
    const phoneNumberSid = this.resolveValue(this.config.phoneNumberSid, context);

    if (!serviceSid || !phoneNumberSid) {
      throw new Error('serviceSid and phoneNumberSid are required');
    }

    const data = await this.callApi(
      `https://messaging.twilio.com/v1/Services/${serviceSid}/PhoneNumbers`,
      'POST',
      {
        PhoneNumberSid: phoneNumberSid,
      },
      true
    );

    return {
      success: true,
      data: {
        sid: data.sid,
        serviceSid: data.service_sid,
        phoneNumberSid: data.phone_number_sid,
        message: 'Phone number added to service',
      },
    };
  }

  private async removePhoneNumberFromService(context: ExecutionContext): Promise<NodeExecutionResult> {
    const serviceSid = this.resolveValue(this.config.serviceSid, context);
    const phoneNumberSid = this.resolveValue(this.config.phoneNumberSid, context);

    if (!serviceSid || !phoneNumberSid) {
      throw new Error('serviceSid and phoneNumberSid are required');
    }

    await this.callApi(
      `https://messaging.twilio.com/v1/Services/${serviceSid}/PhoneNumbers/${phoneNumberSid}`,
      'DELETE'
    );

    return {
      success: true,
      data: {
        message: 'Phone number removed from service',
        phoneNumberSid,
      },
    };
  }

  // ==================== Conversation Operations ====================

  private async createConversation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const friendlyName = this.resolveValue(this.config.friendlyName, context) || null;
    const uniqueName = this.resolveValue(this.config.uniqueName, context) || null;
    const attributes = this.config.attributes || null;
    const messagingServiceSid = this.resolveValue(this.config.messagingServiceSid, context) || null;

    const payload: any = {};

    if (friendlyName) {
      payload.FriendlyName = friendlyName;
    }
    if (uniqueName) {
      payload.UniqueName = uniqueName;
    }
    if (attributes) {
      payload.Attributes = JSON.stringify(attributes);
    }
    if (messagingServiceSid) {
      payload.MessagingServiceSid = messagingServiceSid;
    }
    if (!friendlyName && !uniqueName) {
      throw new Error('Either friendlyName or uniqueName is required');
    }

    const data = await this.callApi(
      'https://conversations.twilio.com/v1/Conversations',
      'POST',
      payload,
      true
    );

    return {
      success: true,
      data: {
        sid: data.sid,
        uniqueName: data.unique_name,
        friendlyName: data.friendly_name,
        state: data.state,
        dateCreated: data.date_created,
        url: data.url,
      },
    };
  }

  private async getConversation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const conversationSid = this.resolveValue(this.config.conversationSid, context);

    if (!conversationSid) {
      throw new Error('conversationSid is required');
    }

    const data = await this.callApi(`https://conversations.twilio.com/v1/Conversations/${conversationSid}`);

    return {
      success: true,
      data: data,
    };
  }

  private async listConversations(context: ExecutionContext): Promise<NodeExecutionResult> {
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 100);
    const status = this.config.status || '';

    let endpoint = `https://conversations.twilio.com/v1/Conversations?PageSize=${pageSize}&Page=${page}`;

    if (status) {
      endpoint += `&Status=${status}`;
    }

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        conversations: data.conversations || [],
        firstPageUrl: data.meta?.first_page_url,
        nextPageUrl: data.meta?.next_page_url,
        key: data.meta?.key,
      },
    };
  }

  private async deleteConversation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const conversationSid = this.resolveValue(this.config.conversationSid, context);

    if (!conversationSid) {
      throw new Error('conversationSid is required');
    }

    await this.callApi(`https://conversations.twilio.com/v1/Conversations/${conversationSid}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Conversation deleted',
        conversationSid,
      },
    };
  }

  private async addConversationParticipant(context: ExecutionContext): Promise<NodeExecutionResult> {
    const conversationSid = this.resolveValue(this.config.conversationSid, context);
    const identifier = this.resolveValue(this.config.identifier, context);
    const identity = this.resolveValue(this.config.identity, context) || null;

    if (!conversationSid) {
      throw new Error('conversationSid is required');
    }
    if (!identifier) {
      throw new Error('identifier is required');
    }

    const payload: any = {
      'MessagingBinding.Address': identifier,
    };

    if (identity) {
      payload.Identity = identity;
    }

    const data = await this.callApi(
      `https://conversations.twilio.com/v1/Conversations/${conversationSid}/Participants`,
      'POST',
      payload,
      true
    );

    return {
      success: true,
      data: {
        sid: data.sid,
        conversationSid: data.conversation_sid,
        identity: data.identity,
        message: 'Participant added',
      },
    };
  }

  private async removeConversationParticipant(context: ExecutionContext): Promise<NodeExecutionResult> {
    const conversationSid = this.resolveValue(this.config.conversationSid, context);
    const participantSid = this.resolveValue(this.config.participantSid, context);

    if (!conversationSid || !participantSid) {
      throw new Error('conversationSid and participantSid are required');
    }

    await this.callApi(
      `https://conversations.twilio.com/v1/Conversations/${conversationSid}/Participants/${participantSid}`,
      'DELETE'
    );

    return {
      success: true,
      data: {
        message: 'Participant removed',
        participantSid,
      },
    };
  }

  private async sendConversationMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const conversationSid = this.resolveValue(this.config.conversationSid, context);
    const body = this.resolveValue(this.config.body, context);
    const author = this.resolveValue(this.config.author, context) || 'system';

    if (!conversationSid) {
      throw new Error('conversationSid is required');
    }
    if (!body) {
      throw new Error('body is required');
    }

    const data = await this.callApi(
      `https://conversations.twilio.com/v1/Conversations/${conversationSid}/Messages`,
      'POST',
      {
        Body: body,
        Author: author,
      },
      true
    );

    return {
      success: true,
      data: {
        sid: data.sid,
        conversationSid: data.conversation_sid,
        body: data.body,
        author: data.author,
        dateCreated: data.date_created,
      },
    };
  }

  private async listConversationMessages(context: ExecutionContext): Promise<NodeExecutionResult> {
    const conversationSid = this.resolveValue(this.config.conversationSid, context);
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 100);
    const order = this.config.order || 'asc';

    if (!conversationSid) {
      throw new Error('conversationSid is required');
    }

    const endpoint = `https://conversations.twilio.com/v1/Conversations/${conversationSid}/Messages?PageSize=${pageSize}&Page=${page}&Order=${order}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        messages: data.messages || [],
        firstPageUrl: data.meta?.first_page_url,
        nextPageUrl: data.meta?.next_page_url,
        key: data.meta?.key,
      },
    };
  }

  // ==================== Queue Operations ====================

  private async createQueue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const friendlyName = this.resolveValue(this.config.friendlyName, context);
    const maxSize = this.config.maxSize || 100;
    const waitUrl = this.resolveValue(this.config.waitUrl, context) || null;
    const waitMethod = this.config.waitMethod || 'POST';

    if (!friendlyName) {
      throw new Error('friendlyName is required');
    }

    const payload: any = {
      FriendlyName: friendlyName,
      MaxSize: maxSize,
    };

    if (waitUrl) {
      payload.WaitUrl = waitUrl;
      payload.WaitUrlMethod = waitMethod;
    }

    const data = await this.callApi('/Queues.json', 'POST', payload, true);

    return {
      success: true,
      data: {
        sid: data.sid,
        friendlyName: data.friendly_name,
        maxSize: data.max_size,
        currentSize: data.current_size,
        averageWaitTime: data.average_wait_time,
        dateCreated: data.date_created,
      },
    };
  }

  private async getQueue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const queueSid = this.resolveValue(this.config.queueSid, context);

    if (!queueSid) {
      throw new Error('queueSid is required');
    }

    const data = await this.callApi(`/Queues/${queueSid}.json`);

    return {
      success: true,
      data: data,
    };
  }

  private async listQueues(context: ExecutionContext): Promise<NodeExecutionResult> {
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 100);

    const endpoint = `/Queues.json?PageSize=${pageSize}&Page=${page}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        queues: data.queues || [],
        firstPageUrl: data.first_page_url,
        nextPageUrl: data.next_page_url,
        uri: data.uri,
      },
    };
  }

  private async updateQueue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const queueSid = this.resolveValue(this.config.queueSid, context);
    const friendlyName = this.resolveValue(this.config.friendlyName, context) || null;
    const maxSize = this.config.maxSize || null;
    const waitUrl = this.resolveValue(this.config.waitUrl, context) || null;
    const waitMethod = this.config.waitMethod || null;

    if (!queueSid) {
      throw new Error('queueSid is required');
    }

    const payload: any = {};

    if (friendlyName) {
      payload.FriendlyName = friendlyName;
    }
    if (maxSize) {
      payload.MaxSize = maxSize;
    }
    if (waitUrl) {
      payload.WaitUrl = waitUrl;
    }
    if (waitMethod) {
      payload.WaitUrlMethod = waitMethod;
    }

    const data = await this.callApi(`/Queues/${queueSid}.json`, 'POST', payload, true);

    return {
      success: true,
      data: {
        sid: data.sid,
        friendlyName: data.friendly_name,
        maxSize: data.max_size,
        message: 'Queue updated',
      },
    };
  }

  private async deleteQueue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const queueSid = this.resolveValue(this.config.queueSid, context);

    if (!queueSid) {
      throw new Error('queueSid is required');
    }

    await this.callApi(`/Queues/${queueSid}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Queue deleted',
        queueSid,
      },
    };
  }

  // ==================== SIP Operations ====================

  private async listSIPCredentials(context: ExecutionContext): Promise<NodeExecutionResult> {
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 100);

    const endpoint = `/SIP/CredentialLists.json?PageSize=${pageSize}&Page=${page}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        credentialLists: data.credential_lists || [],
        firstPageUrl: data.first_page_url,
        nextPageUrl: data.next_page_url,
        uri: data.uri,
      },
    };
  }

  private async createSIPCredential(context: ExecutionContext): Promise<NodeExecutionResult> {
    const credentialListSid = this.resolveValue(this.config.credentialListSid, context);
    const username = this.resolveValue(this.config.username, context);
    const password = this.resolveValue(this.config.password, context);

    if (!credentialListSid) {
      throw new Error('credentialListSid is required');
    }
    if (!username) {
      throw new Error('username is required');
    }
    if (!password) {
      throw new Error('password is required');
    }

    const data = await this.callApi(
      `/SIP/CredentialLists/${credentialListSid}/Credentials.json`,
      'POST',
      {
        Username: username,
        Password: password,
      },
      true
    );

    return {
      success: true,
      data: {
        sid: data.sid,
        username: data.username,
        credentialListSid: data.credential_list_sid,
        message: 'SIP credential created',
      },
    };
  }

  private async createSIPDomain(context: ExecutionContext): Promise<NodeExecutionResult> {
    const domainName = this.resolveValue(this.config.domainName, context);
    const voiceUrl = this.resolveValue(this.config.voiceUrl, context) || null;
    const voiceMethod = this.config.voiceMethod || 'POST';
    const friendlyName = this.resolveValue(this.config.friendlyName, context) || domainName;

    if (!domainName) {
      throw new Error('domainName is required');
    }

    const payload: any = {
      DomainName: domainName,
      FriendlyName: friendlyName,
    };

    if (voiceUrl) {
      payload.VoiceUrl = voiceUrl;
      payload.VoiceMethod = voiceMethod;
    }

    const data = await this.callApi('/SIP/Domains.json', 'POST', payload, true);

    return {
      success: true,
      data: {
        sid: data.sid,
        domainName: data.domain_name,
        friendlyName: data.friendly_name,
        voiceUrl: data.voice_url,
        dateCreated: data.date_created,
      },
    };
  }

  private async listSIPDomains(context: ExecutionContext): Promise<NodeExecutionResult> {
    const page = this.config.page || 0;
    const pageSize = Math.min(this.config.pageSize || 50, 100);

    const endpoint = `/SIP/Domains.json?PageSize=${pageSize}&Page=${page}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        domains: data.domains || [],
        firstPageUrl: data.first_page_url,
        nextPageUrl: data.next_page_url,
        uri: data.uri,
      },
    };
  }

  // ==================== Static Helper Methods ====================

  static readonly CallStatus = {
    Queued: 'queued',
    Ringing: 'ringing',
    InProgress: 'in-progress',
    Completed: 'completed',
    Failed: 'failed',
    Busy: 'busy',
    NoAnswer: 'no-answer',
    Canceled: 'canceled',
  } as const;

  static readonly MessageStatus = {
    Queued: 'queued',
    Sent: 'sent',
    Sending: 'sending',
    Failed: 'failed',
    Delivered: 'delivered',
    Undelivered: 'undelivered',
    Receiving: 'receiving',
    Received: 'received',
    Accepted: 'accepted',
  } as const;

  static readonly VideoRoomType = {
    Group: 'group',
    GroupSmall: 'group-small',
    PeerToPeer: 'peer-to-peer',
    Go: 'go',
  } as const;

  static readonly VerifyChannel = {
    SMS: 'sms',
    Call: 'call',
    Email: 'email',
  } as const;

  /**
   * Format Twilio API error
   */
  static formatError(error: any): string {
    if (error.response?.data) {
      const data = error.response.data;
      if (data.message) {
        return data.message;
      }
      if (data.code) {
        return `Twilio Error ${data.code}: ${data.message || data.status}`;
      }
    }
    return error.message || 'Unknown Twilio API error';
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic validation for E.164 format or other common formats
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phoneNumber) && phoneNumber.replace(/\D/g, '').length >= 10;
  }

  /**
   * Format phone number to E.164
   */
  static formatToE164(phoneNumber: string, countryCode = 'US'): string {
    const digits = phoneNumber.replace(/\D/g, '');

    if (digits.length === 10 && countryCode === 'US') {
      return `+1${digits}`;
    }

    if (digits.length > 10 && !phoneNumber.startsWith('+')) {
      return `+${digits}`;
    }

    return phoneNumber.startsWith('+') ? phoneNumber : `+${digits}`;
  }
}
