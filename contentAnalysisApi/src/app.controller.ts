import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class ContentSummaryCommand {
  @ApiProperty({
    example: 'Mary had a little lamb',
    description: 'The age of the Cat',
  })
  content: string;
  apiKey: string;
}

export class ContentSummaryResponse {
  @ApiProperty({
    example: 'summary goes here',
    description: 'summary response',
  })
  summary: string;

  @ApiProperty({
    example: 'edtech, edchat, math',
    description: 'content tags go here',
  })
  contentTags: string;

  @ApiProperty({
    example: true,
    description: 'Did an error happen?',
  })
  success: boolean;

  @ApiProperty({
    example: 'bad things go here',
    description: 'Error details',
  })
  errorMessage: string = '';
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('contentSummary')
  @ApiOkResponse({ status: 200 })
  async contentSummary(
    @Body() command: ContentSummaryCommand,
  ): Promise<ContentSummaryResponse> {
    const response = new ContentSummaryResponse();

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    try {
      const summaryText = await this.getSummary(command, model);
      const contentTags = await this.getContentTags(command, model);

      response.summary = summaryText;
      response.contentTags = contentTags;
      response.success = true;

      return response;
    } catch (error: any) {
      response.success = false;
      response.errorMessage = error.message;
      return response;
    }
  }

  private async getSummary(command: ContentSummaryCommand, model) {
    const prompt =
      'Write a summary of the following content.  Use only the context given. : ' + command.content;

    const result = await model.generateContent(prompt);
    const genAIResponse = await result.response;
    const summaryText = genAIResponse.text();
    return summaryText.trim();
  }

  private async getContentTags(command: ContentSummaryCommand, model) {
    const prompt =
      'Recommend content tags for the following content and format as comma separated list. Use only the context given: ' +
      command.content;

    const result = await model.generateContent(prompt);
    const genAIResponse = await result.response;
    return genAIResponse.text().trim();
  }
}
