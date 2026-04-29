DO $$
DECLARE
  target_escritorio uuid;
  demo_note text := 'Dados demonstrativos criados para teste do PrazoContábil. As empresas cadastradas usam informações públicas básicas e documentos fictícios para simulação de vencimentos, obrigações e alertas.';
  regime_note text := 'Regime usado apenas para demonstração/teste; confirmar em uso real.';
  cnpj_list text[] := ARRAY[
    '00.000.000/0001-91','00.360.305/0001-04','33.000.167/0001-01','34.028.316/0001-03',
    '33.657.248/0001-89','33.683.111/0001-07','42.422.253/0001-01','00.348.003/0001-10',
    '00.352.294/0001-10','26.461.699/0001-80','09.168.704/0001-42'
  ];
  emp record;
  doc_types text[] := ARRAY['CND Federal','CND Estadual','CND Municipal','Certificado Digital','Alvará Municipal','Certidão FGTS','Certidão Trabalhista'];
  obr_types text[] := ARRAY['DCTFWeb','EFD-Reinf','eSocial','SPED Fiscal','SPED Contribuições','ECD','ECF','MIT','Outras obrigações'];
  comps text[] := ARRAY['01/2026','02/2026','03/2026','04/2026'];
  task_titles text[] := ARRAY['Solicitar CND atualizada','Renovar certificado digital','Conferir obrigação acessória','Cobrar documento do cliente','Revisar cadastro da empresa','Gerar relatório de pendências'];
  responsaveis text[] := ARRAY['Equipe Fiscal','Ana Martins','Bruno Costa','Camila Rocha','Diego Alves'];
  i integer;
  j integer;
  k integer;
  seed integer;
  doc_id uuid;
  obr_id uuid;
BEGIN
  SELECT escritorio_id INTO target_escritorio
  FROM public.usuarios
  WHERE lower(email) = 'edicunhabr@gmail.com'
  LIMIT 1;

  IF target_escritorio IS NULL THEN
    INSERT INTO public.escritorios (nome, cnpj, email, telefone, plano)
    VALUES ('PrazoContábil Demonstração', '00.111.222/0001-33', 'edicunhabr@gmail.com', '(11) 3000-4040', 'profissional')
    RETURNING id INTO target_escritorio;
  END IF;

  DELETE FROM public.alertas
  WHERE empresa_id IN (SELECT id FROM public.empresas WHERE escritorio_id = target_escritorio AND cnpj = ANY(cnpj_list));
  DELETE FROM public.tarefas
  WHERE empresa_id IN (SELECT id FROM public.empresas WHERE escritorio_id = target_escritorio AND cnpj = ANY(cnpj_list));
  DELETE FROM public.obrigacoes
  WHERE empresa_id IN (SELECT id FROM public.empresas WHERE escritorio_id = target_escritorio AND cnpj = ANY(cnpj_list));
  DELETE FROM public.documentos
  WHERE empresa_id IN (SELECT id FROM public.empresas WHERE escritorio_id = target_escritorio AND cnpj = ANY(cnpj_list));
  DELETE FROM public.emails_alerta
  WHERE empresa_id IN (SELECT id FROM public.empresas WHERE escritorio_id = target_escritorio AND cnpj = ANY(cnpj_list));
  DELETE FROM public.empresas
  WHERE escritorio_id = target_escritorio AND cnpj = ANY(cnpj_list);

  INSERT INTO public.empresas (escritorio_id, razao_social, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal, regime_tributario, uf, municipio, email_cliente, telefone, status, risco_score, natureza_juridica, setor, endereco, cep, responsavel_interno, observacao_geral)
  VALUES
    (target_escritorio,'Banco do Brasil S.A.','Banco do Brasil / Direção Geral','00.000.000/0001-91','Não informado','Não informado','Lucro Real','DF','Brasília','cliente-demo-bb@example.com','','ativa',92,'Sociedade de Economia Mista','Bancário','SAUN Quadra 5, Lote B, Asa Norte, Brasília-DF','70040-912','Equipe Fiscal',demo_note),
    (target_escritorio,'Caixa Econômica Federal','CAIXA / CEF Matriz','00.360.305/0001-04','Não informado','Não informado','Lucro Real','DF','Brasília','cliente-demo-caixa@example.com','','ativa',74,'Empresa Pública','Bancário','SBS Quadra 4, Lote 3/4, Asa Sul, Brasília-DF','70070-140','Equipe Fiscal',demo_note),
    (target_escritorio,'Petróleo Brasileiro S.A. - Petrobras','Petrobras','33.000.167/0001-01','Não informado','Não informado','Lucro Real','RJ','Rio de Janeiro','cliente-demo-petrobras@example.com','','ativa',88,'Sociedade de Economia Mista','Energia, petróleo e gás','Rua Henrique Valadares, 28, Centro, Rio de Janeiro-RJ','20231-030','Equipe Fiscal',demo_note),
    (target_escritorio,'Empresa Brasileira de Correios e Telégrafos','Correios','34.028.316/0001-03','Não informado','Não informado','Lucro Real','DF','Brasília','cliente-demo-correios@example.com','','ativa',67,'Empresa Pública','Logística e serviços postais','Não informado','Não informado','Equipe Fiscal',demo_note),
    (target_escritorio,'Banco Nacional de Desenvolvimento Econômico e Social','BNDES','33.657.248/0001-89','Não informado','Não informado','Lucro Real','RJ','Rio de Janeiro','cliente-demo-bndes@example.com','','ativa',52,'Empresa Pública','Desenvolvimento econômico e financiamento','Não informado','Não informado','Equipe Fiscal',demo_note),
    (target_escritorio,'Serviço Federal de Processamento de Dados','SERPRO','33.683.111/0001-07','Não informado','Não informado','Lucro Real','DF','Brasília','cliente-demo-serpro@example.com','','ativa',46,'Empresa Pública Federal','Tecnologia da informação e governo digital','SGAN Quadra 601, Módulo V, Brasília-DF','70836-900','Equipe Fiscal',demo_note),
    (target_escritorio,'Empresa de Tecnologia e Informações da Previdência S.A.','Dataprev','42.422.253/0001-01','Não informado','Não informado','Lucro Real','DF','Brasília','cliente-demo-dataprev@example.com','','ativa',61,'Empresa Pública','Tecnologia da informação previdenciária','Não informado','Não informado','Equipe Fiscal',demo_note),
    (target_escritorio,'Empresa Brasileira de Pesquisa Agropecuária','Embrapa','00.348.003/0001-10','07.316.897/001-00','Não informado','Lucro Real','DF','Brasília','cliente-demo-embrapa@example.com','','ativa',39,'Empresa Pública','Pesquisa agropecuária','Não informado','Não informado','Equipe Fiscal',demo_note),
    (target_escritorio,'Empresa Brasileira de Infraestrutura Aeroportuária','Infraero','00.352.294/0001-10','Não informado','Não informado','Lucro Real','DF','Brasília','cliente-demo-infraero@example.com','','ativa',83,'Empresa Pública Federal','Infraestrutura aeroportuária','Não informado','Não informado','Equipe Fiscal',demo_note),
    (target_escritorio,'Companhia Nacional de Abastecimento','Conab','26.461.699/0001-80','Não informado','Não informado','Lucro Real','DF','Brasília','cliente-demo-conab@example.com','','ativa',58,'Empresa Pública','Abastecimento, logística e políticas agrícolas','Não informado','Não informado','Equipe Fiscal',demo_note),
    (target_escritorio,'Empresa Brasil de Comunicação S.A.','EBC / TV Brasil','09.168.704/0001-42','Não informado','Não informado','Lucro Real','DF','Brasília','cliente-demo-ebc@example.com','','ativa',44,'Empresa Pública / Sociedade Anônima','Comunicação pública','Não informado','Não informado','Equipe Fiscal',demo_note);

  i := 0;
  FOR emp IN SELECT * FROM public.empresas WHERE escritorio_id = target_escritorio AND cnpj = ANY(cnpj_list) ORDER BY razao_social LOOP
    INSERT INTO public.emails_alerta (empresa_id, email, principal)
    VALUES (emp.id, emp.email_cliente, true);

    FOR j IN 1..array_length(doc_types, 1) LOOP
      seed := i + j;
      INSERT INTO public.documentos (empresa_id, escritorio_id, tipo_documento, numero_documento, data_emissao, data_vencimento, arquivo_url, observacoes)
      VALUES (
        emp.id,
        target_escritorio,
        doc_types[j],
        'DEMO-' || lpad((i + 1)::text, 2, '0') || '-' || lpad(j::text, 2, '0'),
        current_date - ((j * 24 + i * 3 + 30) || ' days')::interval,
        current_date + ((ARRAY[-18, 9, 74, -4, 26, 120, 45])[((seed - 1) % 7) + 1] || ' days')::interval,
        CASE WHEN seed % 3 <> 0 THEN lower(regexp_replace(emp.nome_fantasia, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || lower(regexp_replace(doc_types[j], '[^a-zA-Z0-9]+', '-', 'g')) || '.pdf' ELSE NULL END,
        CASE WHEN seed % 4 = 0 THEN 'aguardando envio pelo cliente' ELSE 'Documento fictício para demonstração/teste.' END
      ) RETURNING id INTO doc_id;

      IF seed % 2 = 0 THEN
        INSERT INTO public.alertas (escritorio_id, empresa_id, documento_id, data_alerta, tipo_alerta, mensagem)
        VALUES (target_escritorio, emp.id, doc_id, current_date, 'documento', emp.nome_fantasia || ': atenção para ' || doc_types[j]);
      END IF;
    END LOOP;

    FOR j IN 1..array_length(obr_types, 1) LOOP
      FOR k IN 1..array_length(comps, 1) LOOP
        seed := i + j + k;
        INSERT INTO public.obrigacoes (empresa_id, escritorio_id, competencia, tipo_obrigacao, data_limite, status, responsavel_id, protocolo, observacoes)
        VALUES (
          emp.id,
          target_escritorio,
          comps[k],
          obr_types[j],
          current_date + ((ARRAY[-10, -2, 6, 15, 32])[((seed - 1) % 5) + 1] || ' days')::interval,
          lower(replace((ARRAY['Pendente','Em andamento','Entregue','Atrasada','Não se aplica'])[((seed - 1) % 5) + 1], ' ', '_')),
          NULL,
          CASE WHEN seed % 5 = 0 THEN 'PROTO-DEMO-' || (i + 1)::text || '-' || j::text ELSE NULL END,
          regime_note
        ) RETURNING id INTO obr_id;

        IF seed % 3 = 0 THEN
          INSERT INTO public.alertas (escritorio_id, empresa_id, obrigacao_id, data_alerta, tipo_alerta, mensagem)
          VALUES (target_escritorio, emp.id, obr_id, current_date, 'obrigacao', emp.nome_fantasia || ': obrigação em acompanhamento - ' || obr_types[j]);
        END IF;
      END LOOP;
    END LOOP;

    FOR j IN 1..array_length(task_titles, 1) LOOP
      seed := i + j;
      INSERT INTO public.tarefas (empresa_id, escritorio_id, titulo, tipo, prioridade, responsavel_id, data_limite, status, descricao)
      VALUES (
        emp.id,
        target_escritorio,
        task_titles[j],
        CASE WHEN task_titles[j] ILIKE '%certificado%' THEN 'Certificado' WHEN task_titles[j] ILIKE '%obrigação%' THEN 'Obrigação' WHEN task_titles[j] ILIKE '%relatório%' THEN 'Relatório' ELSE 'Documento' END,
        lower((ARRAY['Baixa','Média','Alta','Crítica'])[((seed - 1) % 4) + 1]),
        NULL,
        current_date + ((ARRAY[-3, 2, 7, 14, 28, 45])[((seed - 1) % 6) + 1] || ' days')::interval,
        lower(replace((ARRAY['A fazer','Em andamento','Aguardando cliente','Concluído','Atrasado'])[((seed - 1) % 5) + 1], ' ', '_')),
        'Tarefa demonstrativa criada para testar kanban, prioridades e radar PrazoContábil.'
      );
    END LOOP;

    i := i + 1;
  END LOOP;
END $$;