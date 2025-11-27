import { userService, productService } from './services/databaseService.ts';

async function run() {
  const email = 'URBHOST@gmail.com';
  try {
    console.log('🔎 Procurando utilizador por email:', email);
    let user = null;
    try {
      user = await userService.getUserByEmail(email);
    } catch (err) {
      // getUserByEmail throws when not found or on error; we'll treat as not found
      console.log('ℹ️  Utilizador não encontrado (ou erro na consulta):', (err as any)?.message || err);
    }

    if (!user) {
      console.error('❌ Utilizador com esse email não existe no Supabase. Crie o utilizador primeiro ou verifique o schema.');
      (process as any).exit(1);
    }

    console.log('✅ Utilizador encontrado:', { id: user.id, email: user.email, name: user.name });

    const newProduct = {
      title: 'Produto de teste - Publicação automática',
      price: 1999.99,
      image: 'https://picsum.photos/400/400',
      companyName: user.name || 'Empresa Teste',
      category: 'Produto',
      isPromoted: false,
      bankId: user.is_bank ? user.id : null,
      ownerId: user.id,
      description: 'Produto criado pelo script de teste para verificar persistência no Supabase.'
    } as any;

    console.log('🔁 Tentando criar produto no Supabase...');
    const created = await productService.createProduct(newProduct);

    console.log('\n✅ Produto criado com sucesso no Supabase:');
    console.log('ID:', created.id);
    console.log('Title:', created.title);
    console.log('Owner ID:', created.owner_id);
    (process as any).exit(0);
  } catch (error: any) {
    console.error('\n❌ Erro ao criar produto:');
    console.error(error?.message || error);

    if (error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
      console.error('\n🔴 PROBLEMA: As tabelas necessárias provavelmente não existem no Supabase.');
      console.error('Solução: abra o Dashboard Supabase → SQL Editor e execute o arquivo supabase/schema.sql');
    } else if (error?.message?.includes('JWT') || error?.message?.includes('auth') || error?.message?.includes('permission')) {
      console.error('\n🔴 PROBLEMA: Falha de autenticação/permissão. Verifique a chave em services/supabaseClient.ts ou as variáveis Vite (.env).');
    }

    (process as any).exit(2);
  }
}

run();