#define IEthanolServiceExists
namespace EngineManagement
{
	class IEthanolService
	{
	public:
		virtual void ReadEthanolContent() = 0;
		float EthanolContent;//0.0-1.0
	};

	extern IEthanolService *CurrentEthanolService;

	IEthanolService* CreateEthanolService(void *config);
}