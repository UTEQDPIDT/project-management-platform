import { UserRole } from '@repo/types';
import { DevelopmentLine } from '../../schemas/development-line.schema.seed';
import { DevelopmentLineSubcategory } from '../../schemas/development-line-subcategory.schema.seed';
import { Division } from '../../schemas/division.schema.seed';
import { EducationalProgram } from '../../schemas/educational-program.schema.seed';
import { KnowledgeArea } from '../../schemas/knowledge-area.schema.seed';
import { PNDpriority } from '../../schemas/pnd-priority.schema.seed';
import { ProductCategory } from '../../schemas/product-category.schema.seed';
import { ProductSubcategory } from '../../schemas/product-subcategory.schema.seed';
import { SustainabilityGoal } from '../../schemas/sustainability-goal.schema.seed';
import { ThemedImpactArea } from '../../schemas/themed-impact-area.schema';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { Programa } from 'src/schemas/project-programs.seed';

//Users
export const divisionsList: Partial<Division>[] = [

];

//Users
export const educationalProgramsList: Partial<EducationalProgram>[] = [
  { name: 'Licenciatura en Administración' },
  { name: 'Licenciatura en Negocios y Mercadotecnia' },
  { name: 'Ingeniería en Logística' },
  { name: 'Licenciatura en Contaduría' },
  { name: 'Licenciatura en Educación' },
  { name: 'Ingeniería Ambiental y Sustentabilidad' },
  { name: 'Ingeniería en Energía y Desarrollo Sostenible' },
  {
    name: 'Ingeniería en Tecnologías de la Información e Innovación Digital',
  },
  { name: 'Ingeniería Mecatrónica' },
  { name: 'Ingeniería en Mantenimiento Industrial' },
  { name: 'Ingeniería en Nanotecnología' },
  { name: 'Ingeniería Industrial' },
  { name: 'Ingeniería Mecánica' },
  { name: 'Ingeniería en Semiconductores' },
  { name: 'Ingeniería Mecánica Automotriz' },
  {
    name: 'Maestría en Ingeniería para la Manufactura Inteligente',
  },
  {
    name: 'Maestría en Economía Circular con especialidad en Proyectos Sustentables',
  },
  {
    name: 'Maestría en Dirección Logística y Cadena de Suministro Sostenible',
  },
];

//Products
export const productCategoryList: Partial<ProductCategory>[] = [
  { name: 'Artículo' },
  { name: 'Capítulo de Libro' },
  { name: 'Cartel' },
  { name: 'Derecho de Autor' },
  { name: 'Diseño Industrial' },
  { name: 'Libro con ISBN' },
  { name: 'Patente' },
  { name: 'Ponencia' },
  { name: 'Reconocimiento' },
  { name:  'IMPI' },
];

//Products
export const productSubcategoryList: Partial<ProductSubcategory>[] = [


  { name: 'Registro de Derecho de autor (ante INDAUTOR)' },
  { name: 'Registro de Diseño industrial (ante IMPI)' },
  {
    name: 'Licenciamiento de Modelo de Utilidad (contrato para comercialización)',
  },
  {
    name: 'Licenciamiento de Patente (contrato para comercialización)',
  },
  { name: 'Ponencia' },
  {
    name: 'Artículo indizado en SCOPUS, JCR, WEB OF SCIENCE o EQUIVALENTE Internacional 1er. autor',
  },
  {
    name: 'Artículo indizado en SCOPUS, JCR, WEB OF SCIENCE o EQUIVALENTE Internacional 2o. autor',
  },
  {
    name: 'Artículo indizado en SCOPUS, JCR, WEB OF SCIENCE o EQUIVALENTE Internacional 3er. autor',
  },
  {
    name: 'Artículo indizado en SCOPUS, JCR, WEB OF SCIENCE o EQUIVALENTE Internacional 4o. autor',
  },
  { name: 'Artículo arbitrado Internacional (1er Autor)' },
  { name: 'Artículo arbitrado Internacional (2° Autor)' },
  { name: 'Artículo arbitrado Internacional (3er. Autor)' },
  { name: 'Artículo arbitrado Internacional (4° Autor)' },
  { name: 'Artículo arbitrado Nacional (1er Autor)' },
  { name: 'Artículo arbitrado Nacional (2° Autor)' },
  { name: 'Artículo arbitrado Nacional (3er. Autor)' },
  { name: 'Artículo arbitrado Nacional (4° Autor)' },
  { name: 'Artículo difusión 1er. autor' },
  { name: 'Artículo difusión 2o. autor' },
  { name: 'Artículo difusión 3er. autor' },
  { name: 'Artículo difusión 4o. autor' },
  { name: 'Artículo indizado Internacional 1er. autor' },
  { name: 'Artículo indizado Internacional 2o. autor' },
  { name: 'Artículo indizado Internacional 3er. autor' },
  { name: 'Artículo indizado Internacional 4o. autor' },
  { name: 'Artículo indizado Nacional (revista Conahcyt) 1er. autor' },
  { name: 'Artículo indizado Nacional (revista Conahcyt) 2o. autor' },
  { name: 'Artículo indizado Nacional (revista Conahcyt) 3er. autor' },
  { name: 'Artículo indizado Nacional (revista Conahcyt) 4o. autor' },
  { name: 'Capítulo de libro con ISBN 1er. autor' },
  { name: 'Capítulo de libro con ISBN 2o. autor' },
  { name: 'Capítulo de libro con ISBN 3er. autor' },
  { name: 'Cartel con participación de alumnos y docentes' },
  { name: 'Libro con ISBN (1er Autor)' },
  { name: 'Libro con ISBN (2° Autor)' },
  { name: 'Libro con ISBN (3er. Autor)' },
  { name: 'Libro con ISBN (4° Autor)' },
  { name: 'Solicitud de patente' },

];

//Projects
export const knowledgeAreaList: Partial<KnowledgeArea>[] = [
  { name: 'Ciencias Agropecuarias' },
  { name: 'Ciencias Naturales y Exactas' },
  { name: 'Ciencias de la Salud' },
  { name: 'Ciencias Sociales y Administrativas' },
  { name: 'Educación, Humanidades y Arte' },
  { name: 'Ingeniería y Tecnología' },
];

//Projects
export const themedImpactAreaList: Partial<ThemedImpactArea>[] = [
  { name: 'Actividades de Economía Social y Solidaria' },
  {
    name: 'Divulgación científica para el fortalecimiento de la comunidad científica y acceso universal al conocimiento',
  },
  { name: 'Bien Común' },
  { name: 'Objetivos de Desarrollo Sustentable' },
  { name: 'Prioridades Nacionales del PND Sección SEHCITI' },
];

//Projects
export const PNDprioritiesList: Partial<PNDpriority>[] = [
  { name: 'Soberanía Alimentaria' },
  { name: 'Soberanía Energética' },
  { name: 'Soberanía Petrolera' },
  { name: 'Soberanía en Materia de Salud' },
  { name: 'Soberanía en Telecomunicaciones' },
  { name: 'Soberanía de la Industria Nacional' },
  { name: 'Desarrollo Tecnológico' },
  { name: 'Sustentabilidad' },
];

//Projects
export const developmentLinesList: Partial<DevelopmentLine>[] = [
  { name: 'Ingeniería y Tecnología (Manufactura Avanzada e Industria 4.0)' },
  { name: 'Ciencias Naturales y Exactas (Sustentabilidad y Biotecnología)' },
  { name: 'Ciencias Sociales y Administrativas (Gestión y Negocios)' },
  { name: 'Ciencias de la Salud (Área Especializada)' },
];

// developmentLineName debe coincidir con el nombre de una línea en developmentLinesList.
export type DevelopmentLineSubcategorySeed = Pick<DevelopmentLineSubcategory, 'name'> & {
  developmentLineName: string;
};

export const developmentLineSubcategoriesList: DevelopmentLineSubcategorySeed[] = [
  { name: 'Automatización y Control: Procesos industriales, robótica, instrumentación y sistemas ciberfísicos', developmentLineName: developmentLinesList[0].name },
  { name: 'Mecatrónica y Manufactura: Diseño mecánico, moldes y troqueles, CNC, y optimización de líneas de producción', developmentLineName: developmentLinesList[0].name },
  { name: 'Tecnologías de la Información: Desarrollo de software seguro, analítica de datos, ciberseguridad, redes, e Inteligencia Artificial', developmentLineName: developmentLinesList[0].name },
  { name: 'Mantenimiento y Electromovilidad: Sistemas automotrices, energías renovables, y eficiencia energética', developmentLineName: developmentLinesList[0].name },
  { name: 'Tecnología Ambiental: Tratamiento de aguas, gestión de residuos, e impacto ambiental del sector productivo', developmentLineName: developmentLinesList[1].name },
  { name: 'Biotecnología y Alimentos: Procesos agroalimentarios, control de calidad biológica, y conservación de recursos naturales', developmentLineName: developmentLinesList[1].name },
  { name: 'Química y Materiales: Nanotecnología aplicada, polímeros, y nuevos materiales sustentables', developmentLineName: developmentLinesList[1].name },
  { name: 'Desarrollo Organizacional: Gestión del factor humano, clima laboral, y responsabilidad social empresarial', developmentLineName: developmentLinesList[2].name },
  { name: 'Logística y Cadena de Suministro: Optimización de inventarios, distribución transfronteriza, y comercio exterior', developmentLineName: developmentLinesList[2].name },
  { name: 'Mercadotecnia y Negocios: Innovación comercial, modelos de negocio digitales, y competitividad de PyMEs', developmentLineName: developmentLinesList[2].name },
  { name: 'Turismo y Gastronomía: Gestión del patrimonio, turismo sustentable, y administración hotelera', developmentLineName: developmentLinesList[2].name },
  { name: 'Terapia Física y Salud Integral: Técnicas de rehabilitación y salud ocupacional en entornos industriales', developmentLineName: developmentLinesList[3].name },
];

//Projects
export const sustainabilityGoalsList: Partial<SustainabilityGoal>[] = [
  { name: 'Reducción de Desperdicios' },
  { name: 'Reuso de Materiales' },
  { name: 'Reciclado de Materiales' },
  { name: 'Responsabilidad Social' },
  { name: 'Concientización sobre Problemas Ambientales' },
  { name: 'Gestión de Recursos Naturales' },
  { name: 'Equidad' },
  { name: 'Inclusión' },
  { name: 'Economía Circular' },
  { name: 'Ninguno' },
];

export const ProgramaList: Partial<Programa>[] = [
  { name: 'Sin Programa' },
  { name: 'Proyecto Interno con Financiamiento' },
  { name: 'Proyecto Externo con Financiamiento' },
  { name: 'Proyecto Interno sin Financiamiento' },
  { name: 'Proyecto Externo sin Financiamiento' },
  { name: 'Estancias'},
  { name: 'Feria de Ciencias'},
];

export const initialUsers: Partial<CreateUserDto>[] = [

];
