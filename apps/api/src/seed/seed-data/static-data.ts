import { UserRole } from '@repo/types';
import { DevelopmentLine } from '../../schemas/development-line.schema.seed';
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
  { name: 'Desarrollo de equipamiento didáctico industrial.' },
  { name: 'Prototipos en eficiencia energética.' },
  {
    name: 'Habilitación de maquinaria industrial para realización de prácticas a pie de máquina.',
  },
  { name: 'Generación de nuevos materiales poliméricos.' },
  {
    name: 'Desarrollo de equipamiento didáctico industrial para la formación profesional en inyección de plásticos y hule.',
  },
  {
    name: 'Desarrollo de las habilidades y competencias profesionales requeridas por el sector de inyección de plásticos y hule en la zona de influencia de la UTEQ, en los estudiantes, egresados y trabajadores de estas empresas.',
  },
  {
    name: 'Diseño y desarrollo de nuevos productos hechos con plástico.',
  },
  { name: 'Desarrollo de competencias profesionales.' },
  { name: 'Desarrollo estratégico académico-empresarial.' },
  { name: 'Innovación e investigación académica-empresarial.' },
  {
    name: 'Investigación aplicada de energías alternativas promoviendo la sostenibilidad y economía circular.',
  },
  { name: 'Seguridad e higiene.' },
  {
    name: 'Desarrollo de materiales nanoestructurados aplicados a la sustentabilidad.',
  },
  {
    name: 'Caracterización de materiales mediante técnicas ópticas, metalúrgicas y fototérmicas aplicables en materiales avanzados, nanoestructurados, metálicos y semiconductores.',
  },
  { name: 'Innovación educativa.' },
  {
    name: 'Desarrollo de aplicaciones de TIC mediante esquemas de la triple hélice.',
  },
  {
    name: 'Fortalecer el proceso de formación y la innovación de los procesos de la gestión de recursos en las organizaciones.',
  },
  {
    name: 'Estudios en educación aplicada a las Licenciaturas en Gestión del Capital Humano e Innovación y Desarrollo de Negocios y la Ingeniería en Logística, de la División Económica Administrativa de la UTEQ.',
  },
  {
    name: 'Innovación Tecnológica en las organizaciones y en las licenciaturas e ingeniería de la División Económica Administrativa de la UTEQ.',
  },
  {
    name: 'Estudio de competencias para identificar, evaluar y desarrollar competencias.',
  },
  { name: 'Manufactura inteligente e industria 4.0.' },
  { name: 'Adquisición, procesamiento y análisis de datos.' },
  {
    name: 'Desarrollo de herramientas tecnológicas para la eficiencia energética y sustentabilidad.',
  },
  { name: 'Desarrollo y aplicación de sistemas embebidos.' },
  { name: 'Desarrollo y aplicación de sistemas mecatrónicos.' },
  { name: 'Estrategias para la sustentabilidad y el bien común.' },
  {
    name: 'Investigación de mercados e instrumentos comerciales para el fomento del desarrollo comercial y social de empresas e instituciones de la región.',
  },
  { name: 'Monitoreo, control y visualización.' },
  {
    name: 'Diseño y desarrollo de materiales inteligentes sustentables.',
  },
  { name: 'Diseño mecánico, experimental y aplicaciones de FEM.' },
  { name: 'Procesos inteligentes & KPI’s.' },
  { name: 'Higiene y seguridad industrial.' },
  {
    name: 'Economía circular aplicada en instituciones educativas, micro y pequeñas empresas.',
  },
  {
    name: 'Economía circular y competencias clave para el aprendizaje permanente.',
  },
  { name: 'Administración, negocios y emprendimiento.' },
  {
    name: 'Gestión de la innovación, la tecnología y el conocimiento en temáticas de innovación multidisciplinares que favorecen las competencias de la comunidad universitaria y la competitividad de la región.',
  },
  {
    name: 'Gestión de la vinculación para la colaboración de la universidad con actores estratégicos de los ecosistemas de innovación.',
  },
  {
    name: 'Aplicaciones biotecnológicas para la síntesis de biomateriales y nanomateriales.',
  },
  { name: 'Inteligencia artificial aplicada en la educación.' },
  { name: 'Producción de metabolitos bacterianos de interés.' },
  { name: 'Biofísica molecular.' },
  { name: 'Biología molecular.' },
  { name: 'Bioinformática.' },
  {
    name: 'Gestión del conocimiento e innovación en las organizaciones/industria de la región orientados a la mejora continua de los procesos.',
  },
  { name: 'Innovación educativa de calidad.' },
  {
    name: 'Transformación digital y tecnológica en las organizaciones.',
  },
  { name: 'Sostenibilidad e innovación empresarial.' },
  { name: 'Teoría Administrativa, Organizacional y Económica.' },
  { name: 'Teoría Educativa y Tecnológica.' },
  { name: 'Logística.' },
  { name: 'Responsabilidad Social.' },
  {
    name: 'Fortalecimiento de las competencias profesionales en educación.',
  },
  {
    name: 'Investigación y desarrollo académico en el proceso de enseñanza-aprendizaje.',
  },
  { name: 'Desarrollo humano en el proceso de aprendizaje.' },
  {
    name: 'Metodología y materiales tecnológicos innovadores para el proceso enseñanza-aprendizaje.',
  },
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
