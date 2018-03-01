#define IMapServiceExists
namespace EngineManagement
{
	class IMapService
	{
	public:
		virtual void ReadMap() = 0;
		float MapBar = 0;
		float MapBarDot = 0;
	};

	extern IMapService *CurrentMapService;

	IMapService* CreateMapService(void *config);
}