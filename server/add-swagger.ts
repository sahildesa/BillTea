import { Project, SyntaxKind, ClassDeclaration, PropertyDeclaration, MethodDeclaration } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

function toTitleCase(str: string) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

function getExampleValue(name: string, type: string) {
  if (name.toLowerCase().includes('email')) return "'john@gmail.com'";
  if (name.toLowerCase().includes('phone') || name.toLowerCase().includes('mobile')) return "'9876543210'";
  if (name.toLowerCase().includes('password')) return "'password123'";
  if (name.toLowerCase().includes('name')) return "'John Doe'";
  if (name.toLowerCase().includes('id')) return "'123e4567-e89b-12d3-a456-426614174000'";
  if (name.toLowerCase().includes('url') || name.toLowerCase().includes('image')) return "'https://example.com/image.jpg'";
  if (type === 'number') return "100";
  if (type === 'boolean') return "true";
  if (type.includes('[]')) return "[]";
  return "'sample_value'";
}

// 1. Update DTOs
const dtoFiles = project.getSourceFiles('src/**/*.dto.ts');
for (const file of dtoFiles) {
  let hasChanges = false;
  let needsApiProperty = false;
  let needsApiPropertyOptional = false;

  const classes = file.getClasses();
  for (const cls of classes) {
    for (const prop of cls.getProperties()) {
      if (prop.getDecorator('ApiProperty') || prop.getDecorator('ApiPropertyOptional')) {
        continue; // Already has it
      }

      const isOptional = prop.hasQuestionToken() || prop.getDecorator('IsOptional') !== undefined;
      const propName = prop.getName();
      const propType = prop.getTypeNode()?.getText() || 'string';
      const example = getExampleValue(propName, propType);

      if (isOptional) {
        prop.addDecorator({
          name: 'ApiPropertyOptional',
          arguments: [`{ example: ${example} }`]
        });
        needsApiPropertyOptional = true;
        hasChanges = true;
      } else {
        prop.addDecorator({
          name: 'ApiProperty',
          arguments: [`{ example: ${example} }`]
        });
        needsApiProperty = true;
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    const importDecl = file.getImportDeclaration('@nestjs/swagger');
    const namedImports = [];
    if (needsApiProperty) namedImports.push('ApiProperty');
    if (needsApiPropertyOptional) namedImports.push('ApiPropertyOptional');
    
    if (importDecl) {
      for (const name of namedImports) {
        if (!importDecl.getNamedImports().some(n => n.getName() === name)) {
          importDecl.addNamedImport(name);
        }
      }
    } else {
      file.addImportDeclaration({
        moduleSpecifier: '@nestjs/swagger',
        namedImports
      });
    }
  }
}

// 2. Update Controllers
const controllerFiles = project.getSourceFiles('src/**/*.controller.ts');
for (const file of controllerFiles) {
  let hasChanges = false;
  const classes = file.getClasses();
  
  for (const cls of classes) {
    if (!cls.getDecorator('Controller')) continue;
    
    if (!cls.getDecorator('ApiTags')) {
      let tagName = cls.getName() || 'Default';
      tagName = tagName.replace('Controller', '');
      cls.addDecorator({
        name: 'ApiTags',
        arguments: [`'${tagName}'`]
      });
      hasChanges = true;
    }
    
    // Add ApiBearerAuth for protected controllers (heuristics: not AuthController, or has UseGuards)
    const isAuthCtrl = cls.getName() === 'AuthController';
    const isHealthCtrl = cls.getName() === 'HealthController';
    if (!cls.getDecorator('ApiBearerAuth') && !isAuthCtrl && !isHealthCtrl) {
      cls.addDecorator({
        name: 'ApiBearerAuth',
        arguments: []
      });
      hasChanges = true;
    }
    
    for (const method of cls.getMethods()) {
      const isRoute = ['Get', 'Post', 'Put', 'Patch', 'Delete'].some(m => method.getDecorator(m) !== undefined);
      if (!isRoute) continue;
      
      if (!method.getDecorator('ApiOperation')) {
        const summary = toTitleCase(method.getName());
        method.addDecorator({
          name: 'ApiOperation',
          arguments: [`{ summary: '${summary}' }`]
        });
        hasChanges = true;
      }
      
      if (!method.getDecorator('ApiResponse')) {
        const isPost = method.getDecorator('Post') !== undefined;
        const status = isPost ? 201 : 200;
        const desc = isPost ? 'Created successfully.' : 'Successful operation.';
        method.addDecorator({
          name: 'ApiResponse',
          arguments: [`{ status: ${status}, description: '${desc}' }`]
        });
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    const importDecl = file.getImportDeclaration('@nestjs/swagger');
    const namedImports = ['ApiTags', 'ApiBearerAuth', 'ApiOperation', 'ApiResponse'];
    
    if (importDecl) {
      for (const name of namedImports) {
        if (!importDecl.getNamedImports().some(n => n.getName() === name)) {
          importDecl.addNamedImport(name);
        }
      }
    } else {
      file.addImportDeclaration({
        moduleSpecifier: '@nestjs/swagger',
        namedImports
      });
    }
  }
}

project.saveSync();
console.log('Swagger documentation added successfully.');
