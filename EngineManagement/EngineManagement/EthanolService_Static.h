namespace EngineManagement
{
	class EthanolService_Static : public IEthanolService
	{
	public:
		EthanolService_Static(float ethanolContent) { EthanolContent = ethanolContent;  }
		void ReadEthanolContent() { };
		float EthanolContent;//0.0-1.0
	};
}