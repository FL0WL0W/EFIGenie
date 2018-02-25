#define IMapServiceExists
namespace EngineManagement
{
	class IMapService
	{
	public:
		virtual void ReadMap() = 0;
		float MapKpa = 0;
		float MapKpaDot = 0;
	};

	extern IMapService *CurrentMapService;

	IMapService* CreateMapService(void *config);
}