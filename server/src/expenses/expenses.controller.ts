import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure the directory exists for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'expenses');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: './uploads/expenses',
        filename: (req, file, cb) => {
          const extension = path.extname(file.originalname);
          cb(null, `${uuidv4()}${extension}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept images and pdfs
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|pdf)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported file type'), false);
        }
      },
    }),
  )
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const attachmentPath = file ? `uploads/expenses/${file.filename}` : '';
    return this.expensesService.create(createExpenseDto, req.user.companyId, req.user.id, attachmentPath);
  }

  @Get()
  findAll(@Req() req: any, @Query('branchId') branchId?: string) {
    return this.expensesService.findAll(req.user.companyId, branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.expensesService.findOne(id, req.user.companyId);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: './uploads/expenses',
        filename: (req, file, cb) => {
          const extension = path.extname(file.originalname);
          cb(null, `${uuidv4()}${extension}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|pdf)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported file type'), false);
        }
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const attachmentPath = file ? `uploads/expenses/${file.filename}` : undefined;
    return this.expensesService.update(id, updateExpenseDto, req.user.companyId, attachmentPath);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.expensesService.remove(id, req.user.companyId);
  }
}
