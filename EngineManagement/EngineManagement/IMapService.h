namespace EngineManagement
{
	class IMapService
	{
	public:
		virtual void ReadMap() = 0;
		float MapKpa = 0;
		float MapKpaDot = 0;
	};
}