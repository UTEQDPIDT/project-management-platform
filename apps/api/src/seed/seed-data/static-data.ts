// import { UserRole } from "@repo/types";
import { DevelopmentLine } from "../../schemas/development-line.schema.seed";
import { Division } from "../../schemas/division.schema.seed";
import { EducationalProgram } from "../../schemas/educational-program.schema.seed";
import { KnowledgeArea } from "../../schemas/knowledge-area.schema.seed";
import { PNDpriority } from "../../schemas/pnd-priority.schema.seed";
import { ProductCategory } from "../../schemas/product-category.schema.seed";
import { ProductSubcategory } from "../../schemas/product-subcategory.schema.seed";
import { SustainabilityGoal } from "../../schemas/sustainability-goal.schema.seed";
import { ThemedImpactArea } from "../../schemas/themed-impact-area.schema";
// import { CreateUserDto } from "../../users/dto/create-user.dto";

//Users
export const divisionsList: Partial<Division>[] = [ 
    { name: 'Division de Tecnología Ambiental' },
    { name: 'Division de Idiomas' },
    { name: 'Division Económico-Administrativa' },
    { name: 'Division Industrial' },
    { name: 'Division de tecnologías de la Automatización e Información' },
    { name: 'Division de Innovación y Desarrollo Tecnológico' }
];

//Users
export const educationalProgramsList: Partial<EducationalProgram>[] = [
    { educationalProgram: 'Licenciatura en Administración' },
    { educationalProgram: 'Licenciatura en Negocios y Mercadotecnia' },
    { educationalProgram: 'Ingeniería en Logística' },
    { educationalProgram: 'Licenciatura en Contaduría' },
    { educationalProgram: 'Licenciatura en Educación' },
    { educationalProgram: 'Ingeniería Ambiental y Sustentabilidad' },
    { educationalProgram: 'Ingeniería en Energía y Desarrollo Sostenible' },
    { educationalProgram: 'Ingeniería en Tecnologías de la Información e Innovación Digital' },
    { educationalProgram: 'Ingeniería Mecatrónica' },
    { educationalProgram: 'Ingeniería en Mantenimiento Industrial' },
    { educationalProgram: 'Ingeniería en Nanotecnología' },
    { educationalProgram: 'Ingeniería Industrial' },
    { educationalProgram: 'Ingeniería Mecánica' },
    { educationalProgram: 'Ingeniería en Semiconductores' },
    { educationalProgram: 'Ingeniería Mecánica Automotriz' },
    { educationalProgram: 'Maestría en Ingeniería para la Manufactura Inteligente' },
    { educationalProgram: 'Maestría en Economía Circular con especialidad en Proyectos Sustentables' },
    { educationalProgram: 'Maestría en Dirección Logística y Cadena de Suministro Sostenible' }
];

//Products
export const productCategoryList: Partial<ProductCategory>[] = [
    { productCategory: 'Artículo' },
    { productCategory: 'Capítulo de Libro' },
    { productCategory: 'Cartel' },
    { productCategory: 'Derecho de Autor' },
    { productCategory: 'Diseño Industrial' },
    { productCategory: 'Informe Técnico' },
    { productCategory: 'Libro con ISBN' },
    { productCategory: 'Licenciamientos' },
    { productCategory: 'Marca' },
    { productCategory: 'Modelo de Utilidad' },
    { productCategory: 'Patente' },
    { productCategory: 'Ponencia' },
    { productCategory: 'Prototipo Funcional' },
    { productCategory: 'Proyecto Tecnológico' },
    { productCategory: 'Reconocimiento' },
];

//Products
export const productSubcategoryList: Partial<ProductSubcategory>[] = [
    { productSubcategory: 'Artículo Arbitrado Internacional' },
    { productSubcategory: 'Artículo Arbitrado Nacional' },
    { productSubcategory: 'Artículo de Difusión' },
    { productSubcategory: 'Artículo Indizado Internacional' },
    { productSubcategory: 'Artículo Indizado Nacional' },
    { productSubcategory: 'Capítulo de Libro con ISBN' },
    { productSubcategory: 'Cartel' },
    { productSubcategory: 'Registro de Derecho de autor (ante INDAUTOR)' },
    { productSubcategory: 'Registro de Diseño industrial (ante IMPI)' },
    { productSubcategory: 'Informe Técnico' },
    { productSubcategory: 'Libro con ISBN' },
    { productSubcategory: 'Licenciamiento de Modelo de Utilidad (contrato para comercialización)' },
    { productSubcategory: 'Licenciamiento de Patente (contrato para comercialización)' },
    { productSubcategory: 'Registro de Marca' },
    { productSubcategory: 'Otorgamiento de Modelo de Utilidad por parte del IMPI' },
    { productSubcategory: 'Registro de Solicitud de Modelo de Utilidad (ante IMPI)' },
    { productSubcategory: 'Otorgamiento de Patente por parte del IMPI' },
    { productSubcategory: 'Registro de Solicitud de Patente (ante IMPI)' },
    { productSubcategory: 'Ponencia' },
    { productSubcategory: 'Prototipo funcional (nuevo o con mejora incremental)' },
    { productSubcategory: 'Proyecto tecnológico' },
    { productSubcategory: 'Distinción o Reconocimiento de Investigador SNII o de Cuerpo Académico' }
];

//Projects
export const knowledgeAreaList: Partial<KnowledgeArea>[] = [
    { knowledgeArea: 'Ciencias Agropecuarias' },
    { knowledgeArea: 'Ciencias Naturales y Exactas' },
    { knowledgeArea: 'Ciencias de la Salud' },
    { knowledgeArea: 'Ciencias Sociales y Administrativas' },
    { knowledgeArea: 'Educación, Humanidades y Arte' },
    { knowledgeArea: 'Ingeniería y Tecnología' },
];

//Projects
export const themedImpactAreaList: Partial<ThemedImpactArea>[] = [
    { themedImpactArea: 'Actividades de Economía Social y Solidaria' },
    { themedImpactArea: 'Divulgación científica para el fortalecimiento de la comunidad científica y acceso universal al conocimiento' },
    { themedImpactArea: 'Bien Común' },
    { themedImpactArea: 'Objetivos de Desarrollo Sustentable' },
    { themedImpactArea: 'Prioridades Nacionales del PND Sección SEHCITI' },
];

//Projects
export const PNDprioritiesList: Partial<PNDpriority>[] = [
    { PNDpriority: 'Soberanía Alimentaria' },
    { PNDpriority: 'Soberanía Energética' },
    { PNDpriority: 'Soberanía Petrolera' },
    { PNDpriority: 'Soberanía en Materia de Salud' },
    { PNDpriority: 'Soberanía en Telecomunicaciones' },
    { PNDpriority: 'Soberanía de la Industria Nacional' },
    { PNDpriority: 'Desarrollo Tecnológico' },
    { PNDpriority: 'Sustentabilidad' }
];

//Projects
export const developmentLinesList: Partial<DevelopmentLine>[] = [
    { developmentLine: "Desarrollo de equipamiento didáctico industrial." },
    { developmentLine: "Prototipos en eficiencia energética." },
    { developmentLine: "Habilitación de maquinaria industrial para realización de prácticas a pie de máquina." },
    { developmentLine: "Generación de nuevos materiales poliméricos." },
    { developmentLine: "Desarrollo de equipamiento didáctico industrial para la formación profesional en inyección de plásticos y hule." },
    { developmentLine: "Desarrollo de las habilidades y competencias profesionales requeridas por el sector de inyección de plásticos y hule en la zona de influencia de la UTEQ, en los estudiantes, egresados y trabajadores de estas empresas." },
    { developmentLine: "Diseño y desarrollo de nuevos productos hechos con plástico." },
    { developmentLine: "Desarrollo de competencias profesionales." },
    { developmentLine: "Desarrollo estratégico académico-empresarial." },
    { developmentLine: "Innovación e investigación académica-empresarial." },
    { developmentLine: "Investigación aplicada de energías alternativas promoviendo la sostenibilidad y economía circular." },
    { developmentLine: "Seguridad e higiene." },
    { developmentLine: "Desarrollo de materiales nanoestructurados aplicados a la sustentabilidad." },
    { developmentLine: "Caracterización de materiales mediante técnicas ópticas, metalúrgicas y fototérmicas aplicables en materiales avanzados, nanoestructurados, metálicos y semiconductores." },
    { developmentLine: "Innovación educativa." },
    { developmentLine: "Desarrollo de aplicaciones de TIC mediante esquemas de la triple hélice." },
    { developmentLine: "Fortalecer el proceso de formación y la innovación de los procesos de la gestión de recursos en las organizaciones." },
    { developmentLine: "Estudios en educación aplicada a las Licenciaturas en Gestión del Capital Humano e Innovación y Desarrollo de Negocios y la Ingeniería en Logística, de la División Económica Administrativa de la UTEQ." },
    { developmentLine: "Innovación Tecnológica en las organizaciones y en las licenciaturas e ingeniería de la División Económica Administrativa de la UTEQ." },
    { developmentLine: "Estudio de competencias para identificar, evaluar y desarrollar competencias." },
    { developmentLine: "Manufactura inteligente e industria 4.0." },
    { developmentLine: "Adquisición, procesamiento y análisis de datos." },
    { developmentLine: "Desarrollo de herramientas tecnológicas para la eficiencia energética y sustentabilidad." },
    { developmentLine: "Desarrollo y aplicación de sistemas embebidos." },
    { developmentLine: "Desarrollo y aplicación de sistemas mecatrónicos." },
    { developmentLine: "Estrategias para la sustentabilidad y el bien común." },
    { developmentLine: "Investigación de mercados e instrumentos comerciales para el fomento del desarrollo comercial y social de empresas e instituciones de la región." },
    { developmentLine: "Monitoreo, control y visualización." },
    { developmentLine: "Diseño y desarrollo de materiales inteligentes sustentables." },
    { developmentLine: "Diseño mecánico, experimental y aplicaciones de FEM." },
    { developmentLine: "Procesos inteligentes & KPI’s." },
    { developmentLine: "Higiene y seguridad industrial." },
    { developmentLine: "Economía circular aplicada en instituciones educativas, micro y pequeñas empresas." },
    { developmentLine: "Economía circular y competencias clave para el aprendizaje permanente." },
    { developmentLine: "Administración, negocios y emprendimiento." },
    { developmentLine: "Gestión de la innovación, la tecnología y el conocimiento en temáticas de innovación multidisciplinares que favorecen las competencias de la comunidad universitaria y la competitividad de la región." },
    { developmentLine: "Gestión de la vinculación para la colaboración de la universidad con actores estratégicos de los ecosistemas de innovación." },
    { developmentLine: "Aplicaciones biotecnológicas para la síntesis de biomateriales y nanomateriales." },
    { developmentLine: "Inteligencia artificial aplicada en la educación." },
    { developmentLine: "Producción de metabolitos bacterianos de interés." },
    { developmentLine: "Biofísica molecular." },
    { developmentLine: "Biología molecular." },
    { developmentLine: "Bioinformática." },
    { developmentLine: "Gestión del conocimiento e innovación en las organizaciones/industria de la región orientados a la mejora continua de los procesos." },
    { developmentLine: "Innovación educativa de calidad." },
    { developmentLine: "Transformación digital y tecnológica en las organizaciones." },
    { developmentLine: "Sostenibilidad e innovación empresarial." },
    { developmentLine: "Teoría Administrativa, Organizacional y Económica." },
    { developmentLine: "Teoría Educativa y Tecnológica." },
    { developmentLine: "Logística." },
    { developmentLine: "Responsabilidad Social." },
    { developmentLine: "Fortalecimiento de las competencias profesionales en educación." },
    { developmentLine: "Investigación y desarrollo académico en el proceso de enseñanza-aprendizaje." },
    { developmentLine: "Desarrollo humano en el proceso de aprendizaje." },
    { developmentLine: "Metodología y materiales tecnológicos innovadores para el proceso enseñanza-aprendizaje." },
];

//Projects
export const sustainabilityGoalsList: Partial<SustainabilityGoal>[] = [
    { sustainabilityGoal: 'Reducción de Desperdicios' },
    { sustainabilityGoal: 'Reuso de Materiales' },
    { sustainabilityGoal: 'Reciclado de Materiales' },
    { sustainabilityGoal: 'Responsabilidad Social' },
    { sustainabilityGoal: 'Concientización sobre Problemas Ambientales' },
    { sustainabilityGoal: 'Gestión de Recursos Naturales' },
    { sustainabilityGoal: 'Equidad' },
    { sustainabilityGoal: 'Inclusión' },
    { sustainabilityGoal: 'Economía Circular' },
    { sustainabilityGoal: 'Ninguno' }
];

// export const initialUsers: Partial<CreateUserDto>[] = [
//     {
//         givenName: 'Gabriela',
//         familyName: 'Juárez',
//         email: 'jsuarez@uteq.edu.mx',
//         matricula: '2018210103',
//         role: UserRole.ADMIN,
//     },
//     {
//         givenName: 'Leticia',
//         familyName: 'Vera',
//         email: 'leticia.vera@uteq.edu.mx',
//         role: UserRole.ADMIN,
//     }
// ];

